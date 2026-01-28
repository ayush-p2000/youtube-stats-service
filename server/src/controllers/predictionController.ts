import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.js';

export const getPredictiveAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.params;
        const { stats, sentiment, comments, apiKey: requestApiKey } = req.body;
        const apiKey = requestApiKey || process.env.YOUTUBE_API_KEY;

        if (!videoId) {
            res.status(400).json({ status: 'error', message: 'Video ID is required' });
            return;
        }

        if (!apiKey && process.env.USE_MOCK_DATA !== 'true') {
            res.status(400).json({ status: 'error', message: 'API Key Required' });
            return;
        }

        if (!stats) {
            res.status(400).json({ status: 'error', message: 'Video statistics are required for prediction' });
            return;
        }

        const prediction = await aiService.runPredictiveAnalytics(stats, sentiment, comments);

        res.json({
            status: 'success',
            data: prediction
        });
    } catch (error) {
        next(error);
    }
};
