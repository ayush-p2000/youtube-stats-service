import type { Request, Response, NextFunction } from 'express';
import ytDlp from 'yt-dlp-exec';
import ytdl from 'ytdl-core';
import type { Agent } from 'http';

export const listFormats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url } = req.body as { url?: string };
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
            const timeoutMs = 8000;
            const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('ytdl timeout')), timeoutMs));
            const info = await Promise.race([
                ytdl.getInfo(canonicalUrl, { requestOptions: { headers: requestHeaders } as { headers: Record<string, string>, agent?: Agent } }),
                timeoutPromise
            ]);
            const videoFormats = info.formats.filter((f) => (f as any).hasVideo && !!f.container);
            const options = videoFormats.map((f) => ({
                format_id: f.itag?.toString(),
                ext: f.container,
                resolution: f.height ? `${f.height}p` : undefined,
                fps: (f as any).fps,
                note: (f as any).qualityLabel,
                filesize: (f as any).contentLength ? Number((f as any).contentLength) : undefined,
                hasAudio: !!(f as any).hasAudio,
            }));
            const uniqueExts = Array.from(new Set(options.map((o) => o.ext).filter(Boolean)));
            res.json({ status: 'success', exts: uniqueExts, formats: options });
            return;
        } catch (_ytdlErr) {
            const timeoutMs = 25000;
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout listing formats')), timeoutMs));
            const infoRaw = await Promise.race([
                ytDlp(canonicalUrl, {
                    dumpSingleJson: true,
                    skipDownload: true,
                    quiet: true,
                    noPlaylist: true,
                    jsRuntimes: 'node',
                } as any),
                timeoutPromise
            ]);
            const infoObj = typeof infoRaw === 'string'
                ? JSON.parse(infoRaw)
                : Buffer.isBuffer(infoRaw)
                    ? JSON.parse(infoRaw.toString('utf-8'))
                    : (infoRaw as any);
            const formats = Array.isArray(infoObj?.formats) ? infoObj.formats : [];
            const videoOnlyOrProgressive = formats.filter((f: any) => f.vcodec && f.vcodec !== 'none' && f.ext);
            const options = videoOnlyOrProgressive.map((f: any) => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.height ? `${f.height}p` : undefined,
                fps: f.fps,
                note: f.format_note,
                filesize: f.filesize || f.filesize_approx,
                hasAudio: !!(f.acodec && f.acodec !== 'none'),
            }));
            const uniqueExts = Array.from(new Set(options.map((o: any) => o.ext)));
            res.json({ status: 'success', exts: uniqueExts, formats: options });
        }
    } catch (error) {
        next(error);
    }
};
