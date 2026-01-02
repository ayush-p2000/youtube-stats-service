import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.js';

export const getPredictiveAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.params;
        const { stats, sentiment, comments } = req.body;

        if (!videoId) {
            res.status(400).json({ status: 'error', message: 'Video ID is required' });
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
