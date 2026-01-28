import type { Request, Response, NextFunction } from 'express';
import ytdl from 'ytdl-core';
import ytDlp from 'yt-dlp-exec';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkFFmpeg, downloadAndMerge } from '../utils/ffmpegMerger.js';
import { downloadJobStore } from '../utils/progressStore.js';
import { runYtDlpWithProgress } from '../utils/ytDlpUtils.js';

const sanitizeFileName = (name: string) => name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'video';
const sanitizeExt = (ext: string) => {
    const normalized = ext.toLowerCase().trim();
    if (!/^[a-z0-9]{1,5}$/.test(normalized)) return undefined;
    return normalized;
};

interface DownloadRequest {
    url?: string;
    format?: string;
    format_id?: string;
    quality?: string;
    bitrate?: string;
}

// Helper to perform the actual background download
const processDownload = async (jobId: string, params: DownloadRequest) => {
    const { url, format, format_id, quality, bitrate } = params;

    try {
        downloadJobStore.updateJob(jobId, { status: 'processing', stage: 'Fetching video info...', progress: 5 });

        if (!url) throw new Error('URL is required'); // Should be checked before

        let canonicalUrl: string;
        try {
            const videoId = ytdl.getURLVideoID(url);
            canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
        } catch {
            throw new Error('Invalid YouTube URL');
        }

        const preferredExt = typeof format === 'string' ? sanitizeExt(format) : undefined;
        const preferredFormatId = typeof format_id === 'string' ? format_id : undefined;
        const preferredQuality = typeof quality === 'string' ? quality : undefined;
        const preferredBitrate = typeof bitrate === 'string' ? bitrate : undefined;

        const requestHeaders = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept-language': 'en-US,en;q=0.9',
            'referer': 'https://www.youtube.com/',
        };

        try {
            // Attempt with ytdl-core first
            const info = await ytdl.getInfo(canonicalUrl, { requestOptions: { headers: requestHeaders } });
            const title = sanitizeFileName(info.videoDetails.title);
            downloadJobStore.updateJob(jobId, { stage: 'Selecting format...', progress: 10 });

            let filteredFormats = info.formats.filter((f) => (f as any).hasVideo && !!f.container);
            let preferredFormat = null;

            // --- Format Selection Logic (Same as before) ---
            if (preferredFormatId) {
                preferredFormat = filteredFormats.find((f) => f.itag?.toString() === preferredFormatId);
                // Note: We'll error later if not found, or fall back depending on logic. 
                // Original logic threw error if format_id provided but not found for ytdl.
                if (!preferredFormat) {
                    // Try to continue, maybe it's only available via yt-dlp logic catch block?
                    // But original logic returned error here. Let's throw.
                    throw new Error(`Format ID ${preferredFormatId} not found`);
                }
            } else {
                // Filter by extension
                if (preferredExt) filteredFormats = filteredFormats.filter((f) => f.container === preferredExt);
                // Filter by quality
                if (preferredQuality) {
                    const qualityNum = parseInt(preferredQuality.replace('p', ''));
                    filteredFormats = filteredFormats.filter((f) => f.height === qualityNum);
                }
                // Filter by bitrate
                if (preferredBitrate) {
                    let targetBitrate: number | undefined;
                    if (preferredBitrate.includes('Mbps')) targetBitrate = parseFloat(preferredBitrate.replace(' Mbps', '')) * 1000000;
                    else if (preferredBitrate.includes('kbps')) targetBitrate = parseFloat(preferredBitrate.replace(' kbps', '')) * 1000;

                    if (targetBitrate) {
                        filteredFormats = filteredFormats.filter((f) => {
                            const formatBitrate = (f as any).bitrate;
                            if (!formatBitrate) return false;
                            return Math.abs(formatBitrate - targetBitrate) / targetBitrate < 0.2;
                        });
                    }
                }

                if (filteredFormats.length === 0) throw new Error('No format matches the selected criteria');

                preferredFormat = ytdl.chooseFormat(filteredFormats, { quality: 'highest', filter: 'audioandvideo' });
                if (!preferredFormat || !preferredFormat.url) {
                    preferredFormat = ytdl.chooseFormat(filteredFormats, { quality: 'highest', filter: 'video' });
                }
            }

            if (!preferredFormat || !preferredFormat.container) throw new Error('No downloadable format available');

            const container = preferredFormat.container || 'mp4';
            let finalFilePath = '';

            // Check for merging
            const hasAudio = (preferredFormat as any)?.hasAudio ?? false;

            if (preferredFormatId && !hasAudio) {
                // NEEDS MERGING
                if (!checkFFmpeg()) throw new Error('FFmpeg required for video-only formats');

                downloadJobStore.updateJob(jobId, { stage: 'Downloading and Merging streams...', progress: 15 });
                const tmpPath = path.join(os.tmpdir(), `${title}_${Date.now()}.${container}`);

                await downloadAndMerge(
                    canonicalUrl,
                    preferredFormatId,
                    tmpPath,
                    (stage, progress) => {
                        // Map stages to overall progress
                        // Download stage: 15-70%, Merge stage: 70-95%
                        let overallProgress = 15;
                        if (stage.includes('Video') || stage.includes('Audio')) {
                            // Rough estimation during download
                            overallProgress = 15 + (progress || 0) * 0.55;
                        } else if (stage.includes('Merging')) {
                            overallProgress = 70 + (progress || 0) * 0.25;
                        }

                        downloadJobStore.updateJob(jobId, {
                            stage: `Processing: ${stage}`,
                            progress: Math.min(99, Math.round(overallProgress))
                        });
                    }
                );
                finalFilePath = tmpPath;

            } else {
                // DIRECT DOWNLOAD
                downloadJobStore.updateJob(jobId, { stage: 'Downloading file...', progress: 15 });
                const tmpPath = path.join(os.tmpdir(), `${title}_${Date.now()}.${container}`);
                const writeStream = fs.createWriteStream(tmpPath);

                const stream = ytdl(canonicalUrl, {
                    format: preferredFormat,
                    requestOptions: { headers: requestHeaders },
                    dlChunkSize: 1024 * 1024,
                    highWaterMark: 1 << 25,
                });

                await new Promise<void>((resolve, reject) => {
                    stream.on('progress', (chunkLength, downloaded, total) => {
                        if (total > 0) {
                            const percent = (downloaded / total) * 100;
                            // Map to 15-99% range
                            const mapped = 15 + (percent * 0.84);
                            downloadJobStore.updateJob(jobId, {
                                progress: Math.min(99, Math.round(mapped)),
                                stage: `Downloading: ${Math.round(percent)}%`
                            });
                        }
                    });
                    stream.pipe(writeStream);
                    writeStream.on('finish', () => resolve());
                    writeStream.on('error', reject);
                    stream.on('error', reject);
                });
                finalFilePath = tmpPath;
            }

            downloadJobStore.updateJob(jobId, {
                status: 'completed',
                progress: 100,
                stage: 'Ready for download',
                filePath: finalFilePath,
                filename: `${title}.${container}`
            });

        } catch (ytdlErr) {
            console.log('Falling back to yt-dlp logic', ytdlErr);
            // --- Fallback to yt-dlp logic ---
            // Simplification: Re-using the yt-dlp direct download approach 
            // but capturing output for progress is hard with existing implementation.
            // For now, we'll just run it and assume indeterminate progress or just jump to finish.

            downloadJobStore.updateJob(jobId, { stage: 'Processing with alternative downloader...', progress: 20 });

            const infoRaw = await ytDlp(canonicalUrl, { dumpSingleJson: true, skipDownload: true, quiet: true, jsRuntimes: 'node', noPlaylist: true } as any);
            const infoObj = typeof infoRaw === 'string' ? JSON.parse(infoRaw) : (infoRaw as any);
            const safeTitle = sanitizeFileName((infoObj?.title as string) || 'video');
            let ext = String(infoObj?.ext || 'webm').toLowerCase();
            let fmtSelector = 'best';
            const formats = Array.isArray(infoObj?.formats) ? infoObj.formats : [];
            const selectedFormat = formats.find((f: any) => f.format_id === preferredFormatId);
            const isVideoOnly = selectedFormat && (selectedFormat.acodec === 'none' || selectedFormat.audio_ext === 'none');

            if (!preferredFormatId) {
                if (preferredExt) ext = preferredExt;
                if (preferredExt && preferredQuality) {
                    fmtSelector = `bestvideo[height<=${preferredQuality.replace('p', '')}][ext=${preferredExt}]+bestaudio/best[height<=${preferredQuality.replace('p', '')}]/best`;
                }
            } else {
                if (selectedFormat && selectedFormat.ext) {
                    ext = selectedFormat.ext.toLowerCase();
                }
            }

            const tmpPath = path.join(os.tmpdir(), `${safeTitle}_${Date.now()}.${ext || 'webm'}`);

            // Determine if we need to merge (only if it's video-only)
            if (preferredFormatId && isVideoOnly && checkFFmpeg()) {
                downloadJobStore.updateJob(jobId, { stage: 'Downloading and Merging streams (Fallback)...', progress: 15 });

                await downloadAndMerge(
                    canonicalUrl,
                    preferredFormatId,
                    tmpPath,
                    (stage, progress) => {
                        // Map 0-100% from downloadAndMerge to 30-95% overall progress
                        const overallProgress = 30 + (progress || 0) * 0.65;

                        downloadJobStore.updateJob(jobId, {
                            stage: `Processing: ${stage}`,
                            progress: Math.min(95, Math.round(overallProgress))
                        });
                    }
                );
            } else {
                // Single stream download (already contains audio or no FFmpeg)
                downloadJobStore.updateJob(jobId, { stage: 'Starting download...', progress: 30 });
                let lastProgress = 30;

                const runWithFormat = async (formatSelector: string, isFallback = false) => {
                    await runYtDlpWithProgress(
                        canonicalUrl,
                        {
                            format: formatSelector,
                            output: tmpPath,
                            noPart: true,
                            noPlaylist: true,
                            progress: true,
                        },
                        (downloadPercent) => {
                            // Map 0-100% download to 30-95% overall progress
                            const mappedProgress = Math.round(30 + downloadPercent * 0.65);

                            if (mappedProgress > lastProgress) {
                                lastProgress = mappedProgress;
                                downloadJobStore.updateJob(jobId, {
                                    stage: `${isFallback ? 'Fallback downloading' : 'Downloading'}: ${Math.round(downloadPercent)}%`,
                                    progress: Math.min(95, mappedProgress),
                                });
                            }
                        }
                    );
                };

                try {
                    // First attempt: strict user-selected format / format_id
                    await runWithFormat(preferredFormatId || fmtSelector);
                } catch (primaryErr: any) {
                    const msg = String(primaryErr?.message || primaryErr || '');
                    const sabrOrForbidden = /SABR streaming|missing a url|HTTP Error 403|HTTP Error 401/i.test(msg);

                    // If YouTube blocks this exact format (SABR/403/etc), try a more tolerant fallback
                    if (sabrOrForbidden) {
                        console.warn(`Primary format ${preferredFormatId || fmtSelector} blocked by YouTube, falling back.`, msg);

                        // Build a safer fallback selector:
                        // - Use bestvideo within requested height/ext when possible
                        // - Merge with bestaudio
                        let fallbackSelector: string;
                        const heightNum = preferredQuality ? preferredQuality.replace('p', '') : '';
                        const fallbackExt = preferredExt || 'mp4';

                        if (heightNum) {
                            fallbackSelector = `bestvideo[height<=${heightNum}][ext=${fallbackExt}]+bestaudio/best[ext=${fallbackExt}]/best`;
                        } else {
                            fallbackSelector = `bestvideo[ext=${fallbackExt}]+bestaudio/best[ext=${fallbackExt}]/best`;
                        }

                        // Try fallback; if this also fails, let it bubble to outer catch so user sees a clear error
                        await runWithFormat(fallbackSelector, true);
                    } else {
                        // Different kind of error, rethrow to be handled by outer catch
                        throw primaryErr;
                    }
                }
            }

            downloadJobStore.updateJob(jobId, {
                status: 'completed',
                progress: 100,
                stage: 'Ready for download',
                filePath: tmpPath,
                filename: `${safeTitle}.${ext}`
            });
        }

    } catch (error: any) {
        console.error(`Job ${jobId} failed:`, error);
        downloadJobStore.updateJob(jobId, {
            status: 'failed',
            error: error.message || 'Download failed'
        });
    }
};

export const initiateDownload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const params = req.body as DownloadRequest;
        if (!params.url || typeof params.url !== 'string') {
            res.status(400).json({ status: 'error', message: 'URL is required' });
            return;
        }

        const jobId = downloadJobStore.createJob();
        // Start background process
        processDownload(jobId, params);

        res.json({ status: 'ok', jobId });
    } catch (error) {
        next(error);
    }
};

export const checkDownloadStatus = (req: Request, res: Response) => {
    const { jobId } = req.params;

    if (!jobId) {
        res.status(400).json({ status: 'error', message: 'Job ID required' });
        return;
    }

    const job = downloadJobStore.getJob(jobId);

    if (!job) {
        res.status(404).json({ status: 'error', message: 'Job not found' });
        return;
    }

    res.json({
        status: 'ok',
        job: {
            id: job.id,
            status: job.status,
            progress: job.progress,
            stage: job.stage,
            error: job.error
        }
    });
};

export const serveDownloadFile = (req: Request, res: Response, next: NextFunction) => {
    const { jobId } = req.params;

    if (!jobId) {
        res.status(400).json({ status: 'error', message: 'Job ID required' });
        return;
    }

    const job = downloadJobStore.getJob(jobId);

    if (!job) {
        res.status(404).json({ status: 'error', message: 'Job not found' });
        return;
    }

    if (job.status !== 'completed' || !job.filePath) {
        res.status(400).json({ status: 'error', message: 'Download not ready' });
        return;
    }

    if (!fs.existsSync(job.filePath)) {
        res.status(500).json({ status: 'error', message: 'File expired or deleted' });
        return;
    }

    const { filePath, filename } = job;
    const ext = path.extname(filename || 'video').slice(1);

    const contentType = ext === 'mp4' ? 'video/mp4' :
        ext === 'webm' ? 'video/webm' :
            ext === '3gp' ? 'video/3gpp' :
                'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => next(err));
    fileStream.on('close', () => {
        // Cleanup file after download
        fs.unlink(filePath, () => { });
    });
    fileStream.pipe(res);
};

// Kept for backward compatibility if needed, but routing should be updated
export const downloadVideo = initiateDownload;
