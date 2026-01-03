import type { Request, Response, NextFunction } from 'express';
import ytdl from 'ytdl-core';
import ytDlp from 'yt-dlp-exec';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkFFmpeg, downloadAndMerge } from '../utils/ffmpegMerger.js';

const sanitizeFileName = (name: string) => name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'video';
const sanitizeExt = (ext: string) => {
    const normalized = ext.toLowerCase().trim();
    if (!/^[a-z0-9]{1,5}$/.test(normalized)) return undefined;
    return normalized;
};

export const downloadVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url, format, format_id, quality, bitrate } = req.body as { 
            url?: string; 
            format?: string; 
            format_id?: string;
            quality?: string;
            bitrate?: string;
        };
        if (!url || typeof url !== 'string') {
            res.status(400).json({ status: 'error', message: 'URL is required and must be a string' });
            return;
        }
        let canonicalUrl: string;
        try {
            const videoId = ytdl.getURLVideoID(url);
            canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } catch {
            res.status(400).json({ status: 'error', message: 'Invalid YouTube URL' });
            return;
        }
        const preferredExt = typeof format === 'string' ? sanitizeExt(format) : undefined;
        const preferredFormatId = typeof format_id === 'string' ? format_id : undefined;
        const preferredQuality = typeof quality === 'string' ? quality : undefined;
        const preferredBitrate = typeof bitrate === 'string' ? bitrate : undefined;
        const requestHeaders = {
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept':
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'accept-language': 'en-US,en;q=0.9',
            'referer': 'https://www.youtube.com/',
            'cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+832',
        };

        try {
            const info = await ytdl.getInfo(canonicalUrl, { requestOptions: { headers: requestHeaders } });
            const title = sanitizeFileName(info.videoDetails.title);
            
            let filteredFormats = info.formats.filter((f) => (f as any).hasVideo && !!f.container);
            let preferredFormat = null;
            
            // If format_id is provided, use it directly (highest priority)
            if (preferredFormatId) {
                preferredFormat = filteredFormats.find((f) => f.itag?.toString() === preferredFormatId);
                if (!preferredFormat) {
                    // Format ID not found in available formats, return error
                    res.status(400).json({ 
                        status: 'error', 
                        message: `Format ID ${preferredFormatId} not found for this video. Available format IDs: ${filteredFormats.slice(0, 10).map(f => f.itag).join(', ')}...` 
                    });
                    return;
                }
                // Found format by ID - use it directly, even if it's video-only
                // ytdl will handle video-only formats correctly
                console.log(`[Download] Using format_id ${preferredFormatId}: ${preferredFormat.container} ${preferredFormat.height}p (hasAudio: ${(preferredFormat as any).hasAudio})`);
            }
            
            // If format_id wasn't provided, filter by other criteria
            if (!preferredFormat) {
                // Filter by extension if provided
                if (preferredExt) {
                    filteredFormats = filteredFormats.filter((f) => f.container === preferredExt);
                }
                
                // Filter by quality if provided
                if (preferredQuality) {
                    const qualityNum = parseInt(preferredQuality.replace('p', ''));
                    filteredFormats = filteredFormats.filter((f) => f.height === qualityNum);
                }
                
                // Filter by bitrate if provided (convert from kbps/Mbps string to bps)
                if (preferredBitrate) {
                    let targetBitrate: number | undefined;
                    if (preferredBitrate.includes('Mbps')) {
                        targetBitrate = parseFloat(preferredBitrate.replace(' Mbps', '')) * 1000000;
                    } else if (preferredBitrate.includes('kbps')) {
                        targetBitrate = parseFloat(preferredBitrate.replace(' kbps', '')) * 1000;
                    }
                    if (targetBitrate) {
                        filteredFormats = filteredFormats.filter((f) => {
                            const formatBitrate = (f as any).bitrate;
                            if (!formatBitrate) return false;
                            // Allow 10% tolerance
                            return Math.abs(formatBitrate - targetBitrate) / targetBitrate < 0.1;
                        });
                    }
                }
                
                if (filteredFormats.length === 0) {
                    res.status(400).json({ status: 'error', message: 'No format matches the selected criteria' });
                    return;
                }
                
                // Choose the best format from filtered options
                // Try audioandvideo first, but fall back to videoonly if needed
                preferredFormat = ytdl.chooseFormat(filteredFormats, { quality: 'highest', filter: 'audioandvideo' });

                if (!preferredFormat || !preferredFormat.url) {
                    // Fall back to video-only if no audio+video format available
                    preferredFormat = ytdl.chooseFormat(filteredFormats, { quality: 'highest', filter: 'video' });
                }
            }

            if (!preferredFormat || !preferredFormat.container) {
                res.status(400).json({ status: 'error', message: 'No downloadable format available for this video' });
                return;
            }

            const container = preferredFormat.container || 'mp4';
            const contentType = container === 'mp4'
                ? 'video/mp4'
                : container === 'webm'
                    ? 'video/webm'
                    : container === '3gp'
                        ? 'video/3gpp'
                        : 'application/octet-stream';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${title}.${container}"`);

            // If format_id was provided, check if it needs audio merging
            if (preferredFormatId) {
                const hasAudio = (preferredFormat as any)?.hasAudio ?? false;
                
                // If format has audio, use ytdl directly
                if (hasAudio) {
                    const stream = ytdl(canonicalUrl, {
                        format: preferredFormat,
                        requestOptions: { headers: requestHeaders },
                        dlChunkSize: 1024 * 1024,
                        highWaterMark: 1 << 25,
                    });
                    stream.on('error', (err) => {
                        console.error(`Failed to download format ${preferredFormatId}:`, err);
                        if (!res.headersSent) {
                            res.status(400).json({ 
                                status: 'error', 
                                message: `Failed to download format ${preferredFormatId}: ${err.message}` 
                            });
                        }
                    });
                    stream.pipe(res);
                    return;
                }
                
                // If format doesn't have audio, use ffmpeg to merge with audio
                if (!hasAudio && checkFFmpeg()) {
                    console.log(`[Download] Format ${preferredFormatId} is video-only, merging with audio using ffmpeg`);
                    const tmpPath = path.join(os.tmpdir(), `${title}_${Date.now()}.${container}`);
                    
                    try {
                        await downloadAndMerge(
                            canonicalUrl,
                            preferredFormatId,
                            tmpPath,
                            (stage, progress) => {
                                if (progress !== undefined) {
                                    console.log(`[Download] ${stage}: ${progress}%`);
                                }
                            }
                        );
                        
                        res.setHeader('Content-Type', contentType);
                        res.setHeader('Content-Disposition', `attachment; filename="${title}.${container}"`);
                        
                        const fileStream = fs.createReadStream(tmpPath);
                        fileStream.on('error', (err) => next(err));
                        fileStream.on('close', () => {
                            fs.unlink(tmpPath, () => {});
                        });
                        fileStream.pipe(res);
                        return;
                    } catch (mergeErr) {
                        // Clean up on error
                        if (fs.existsSync(tmpPath)) {
                            fs.unlink(tmpPath, () => {});
                        }
                        throw mergeErr;
                    }
                } else if (!hasAudio && !checkFFmpeg()) {
                    // Video-only format but ffmpeg not available
                    res.status(400).json({
                        status: 'error',
                        message: `Format ${preferredFormatId} is video-only and requires ffmpeg for audio merging. Please install ffmpeg.`
                    });
                    return;
                }
            }

            // Otherwise use the selected format
            const stream = ytdl(canonicalUrl, {
                format: preferredFormat,
                requestOptions: { headers: requestHeaders },
                dlChunkSize: 1024 * 1024,
                highWaterMark: 1 << 25,
            });
            stream.on('error', (err) => next(err));
            stream.pipe(res);
            return;
        } catch (ytdlErr) {
            try {
                const infoRaw = await ytDlp(canonicalUrl, { dumpSingleJson: true, skipDownload: true, quiet: true, jsRuntimes: 'node', noPlaylist: true } as any);
                const infoObj = typeof infoRaw === 'string'
                    ? JSON.parse(infoRaw)
                    : Buffer.isBuffer(infoRaw)
                        ? JSON.parse(infoRaw.toString('utf-8'))
                        : (infoRaw as any);
                const safeTitle = sanitizeFileName((infoObj?.title as string) || 'video');
                
                // Build format selector for yt-dlp
                let fmtSelector = 'best';
                let ext = String(infoObj?.ext || 'webm').toLowerCase();
                
                // If format_id is provided, use it directly (highest priority)
                if (preferredFormatId) {
                    fmtSelector = preferredFormatId;
                    // Try to determine extension from format info
                    const formats = Array.isArray(infoObj?.formats) ? infoObj.formats : [];
                    const selectedFormat = formats.find((f: any) => f.format_id === preferredFormatId);
                    if (selectedFormat && selectedFormat.ext) {
                        ext = selectedFormat.ext.toLowerCase();
                    }
                } else {
                    // Build selector from other criteria
                    const selectors: string[] = [];
                    
                    if (preferredExt) {
                        selectors.push(`ext=${preferredExt}`);
                        ext = preferredExt;
                    }
                    if (preferredQuality) {
                        const qualityNum = preferredQuality.replace('p', '');
                        selectors.push(`height<=${qualityNum}`);
                    }
                    if (preferredBitrate) {
                        // yt-dlp uses kbps for bitrate
                        let bitrateKbps: number | undefined;
                        if (preferredBitrate.includes('Mbps')) {
                            bitrateKbps = parseFloat(preferredBitrate.replace(' Mbps', '')) * 1000;
                        } else if (preferredBitrate.includes('kbps')) {
                            bitrateKbps = parseFloat(preferredBitrate.replace(' kbps', ''));
                        }
                        if (bitrateKbps) {
                            selectors.push(`tbr<=${bitrateKbps}`);
                        }
                    }
                    
                    if (selectors.length > 0) {
                        fmtSelector = `best[${selectors.join('][')}]/best`;
                    } else {
                        fmtSelector = 'best';
                    }
                }
                
                // Check if the selected format has audio
                let needsMerging = false;
                if (preferredFormatId) {
                    const formats = Array.isArray(infoObj?.formats) ? infoObj.formats : [];
                    const selectedFormat = formats.find((f: any) => f.format_id === preferredFormatId);
                    needsMerging = selectedFormat && (!selectedFormat.acodec || selectedFormat.acodec === 'none');
                }

                // If format is video-only and ffmpeg is available, use merging
                if (needsMerging && checkFFmpeg() && preferredFormatId) {
                    console.log(`[Download] Format ${preferredFormatId} is video-only, merging with audio using ffmpeg`);
                    const tmpPath = path.join(os.tmpdir(), `${safeTitle}_${Date.now()}.${ext}`);
                    
                    try {
                        await downloadAndMerge(
                            canonicalUrl,
                            preferredFormatId,
                            tmpPath,
                            (stage, progress) => {
                                if (progress !== undefined) {
                                    console.log(`[Download] ${stage}: ${progress}%`);
                                }
                            }
                        );
                        
                        const contentType = ext === 'mp4'
                            ? 'video/mp4'
                            : ext === 'webm'
                                ? 'video/webm'
                                : ext === '3gp'
                                    ? 'video/3gpp'
                                    : 'application/octet-stream';
                        res.setHeader('Content-Type', contentType);
                        res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);
                        
                        const fileStream = fs.createReadStream(tmpPath);
                        fileStream.on('error', (err) => next(err));
                        fileStream.on('close', () => {
                            fs.unlink(tmpPath, () => {});
                        });
                        fileStream.pipe(res);
                        return;
                    } catch (mergeErr) {
                        if (fs.existsSync(tmpPath)) {
                            fs.unlink(tmpPath, () => {});
                        }
                        throw mergeErr;
                    }
                }

                // Otherwise, download normally
                const tmpPath = path.join(os.tmpdir(), `${safeTitle}.${ext}`);

                await ytDlp(canonicalUrl, {
                    format: preferredFormatId || fmtSelector,
                    output: tmpPath,
                    noPart: true,
                    quiet: true,
                    jsRuntimes: 'node',
                    noPlaylist: true,
                } as any);

                const contentType = ext === 'mp4'
                    ? 'video/mp4'
                    : ext === 'webm'
                        ? 'video/webm'
                        : ext === '3gp'
                            ? 'video/3gpp'
                            : 'application/octet-stream';
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);

                const fileStream = fs.createReadStream(tmpPath);
                fileStream.on('error', (err) => next(err));
                fileStream.on('close', () => {
                    fs.unlink(tmpPath, () => {});
                });
                fileStream.pipe(res);
            } catch (dlpErr) {
                next(dlpErr);
            }
        }
    } catch (error) {
        next(error);
    }
};
