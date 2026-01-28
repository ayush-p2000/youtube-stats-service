import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.js';
import * as youtubeService from '../services/youtubeService.js';
import { generateMockComments } from '../utils/mockYoutubeData.js';

export const analyzeSentiment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId, apiKey: requestApiKey } = req.body;
        const apiKey = requestApiKey || process.env.YOUTUBE_API_KEY;

        if (!videoId) {
            res.status(400).json({ status: 'error', message: 'Video ID is required' });
            return;
        }

        if (!apiKey) {
            if (process.env.USE_MOCK_DATA === 'true') {
                // proceed with mock
            } else {
                res.status(400).json({ status: 'error', message: 'API Key Required' });
                return;
            }
        }

        // Mock data logic
        const useMock = process.env.USE_MOCK_DATA === 'true' || apiKey === 'MOCK';

        let allCommentsData;

        if (useMock) {
            console.log('Using Mock YouTube Data for sentiment analysis (1000 comments)');
            allCommentsData = generateMockComments(1000);
        } else {
            // Fetch ALL comments for this video
            allCommentsData = await youtubeService.getAllVideoComments(videoId, apiKey);
        }

        interface CommentThread {
            snippet: {
                topLevelComment: {
                    snippet: {
                        textDisplay: string;
                    };
                };
            };
        }

        const textOnlyComments = (allCommentsData as CommentThread[]).map((thread) =>
            thread.snippet.topLevelComment.snippet.textDisplay
        );

        if (textOnlyComments.length === 0) {
            res.status(404).json({ status: 'error', message: 'No comments found for this video' });
            return;
        }

        const analysis = await aiService.analyzeCommentsSentiment(textOnlyComments);

        res.json({
            status: 'success',
            data: analysis
        });
    } catch (error) {
        next(error);
    }
};
