import type { Request, Response, NextFunction } from 'express';
import ytdl from 'ytdl-core';
import ytDlp from 'yt-dlp-exec';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const sanitizeFileName = (name: string) => name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'video';
const sanitizeExt = (ext: string) => {
    const normalized = ext.toLowerCase().trim();
    if (!/^[a-z0-9]{1,5}$/.test(normalized)) return undefined;
    return normalized;
};

export const downloadVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url, format } = req.body as { url?: string; format?: string };
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
            let preferredFormat = ytdl.chooseFormat(
                preferredExt ? info.formats.filter((f) => f.container === preferredExt) : info.formats,
                { quality: 'highest', filter: 'audioandvideo' }
            );

            if (!preferredFormat || !preferredFormat.url) {
                preferredFormat = ytdl.chooseFormat(
                    preferredExt ? info.formats.filter((f) => f.container === preferredExt) : info.formats,
                    { quality: 'highest', filter: 'audioandvideo' }
                );
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
                let ext = String(infoObj?.ext || 'webm').toLowerCase();
                if (preferredExt) ext = preferredExt;
                const tmpPath = path.join(os.tmpdir(), `${safeTitle}.${ext}`);

                const fmtSelector = preferredExt ? `best[ext=${preferredExt}]/best` : 'best';

                await ytDlp(canonicalUrl, {
                    format: fmtSelector,
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
