import type { Request, Response, NextFunction } from 'express';

export const parseUrl = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            res.status(400).json({ status: 'error', message: 'URL is required and must be a string' });
            return;
        }

        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
            res.status(400).json({ status: 'error', message: 'URL cannot be empty' });
            return;
        }

        // Regex to extract video ID from various YouTube URL formats
        // Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, etc.
        const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
        const match = trimmedUrl.match(regExp);

        if (match && match[1] && match[1].length === 11) {
            const videoId = match[1];
            // Validate video ID format (alphanumeric, hyphens, underscores)
            if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                res.json({ status: 'success', videoId });
            } else {
                res.status(400).json({ status: 'error', message: 'Invalid YouTube video ID format' });
            }
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid YouTube URL format' });
        }
    } catch (error) {
        next(error);
    }
};
