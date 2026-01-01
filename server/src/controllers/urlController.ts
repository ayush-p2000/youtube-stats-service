import type { Request, Response, NextFunction } from 'express';

export const parseUrl = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ status: 'error', message: 'URL is required' });
            return;
        }

        // Regex to extract video ID from various YouTube URL formats
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            const videoId = match[2];
            res.json({ status: 'success', videoId });
        } else {
            res.status(400).json({ status: 'error', message: 'Invalid YouTube URL' });
        }
    } catch (error) {
        next(error);
    }
};
