import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.js';
import { MOCK_EARNINGS_DATA } from '../utils/mockYoutubeData.js';

export const getEarningsPrediction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.params;
        const { stats, sentiment, comments } = req.body;

        if (!videoId) {
            res.status(400).json({ status: 'error', message: 'Video ID is required' });
            return;
        }

        if (!stats) {
            res.status(400).json({ status: 'error', message: 'Video statistics are required for earnings prediction' });
            return;
        }

        // Mock data logic
        const useMock = process.env.USE_MOCK_DATA === 'true';

        let earningsData;
        if (useMock) {
            console.log('Using Mock Earnings Data');
            earningsData = MOCK_EARNINGS_DATA;
        } else {
            earningsData = await aiService.runEarningsPrediction(stats, sentiment, comments);
        }

        res.json({
            status: 'success',
            data: earningsData
        });
    } catch (error) {
        next(error);
    }
};
