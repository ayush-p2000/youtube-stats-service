import type { Request, Response, NextFunction } from 'express';
import * as youtubeService from '../services/youtubeService.js';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.params;
        const pageToken = req.query.pageToken as string | undefined;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            res.status(500).json({ status: 'error', message: 'YouTube API key not configured' });
            return;
        }

        if (!videoId) {
            res.status(400).json({ status: 'error', message: 'Video ID is required' });
            return;
        }

        // Only fetch video stats if it's the first page (no token)
        const videoDataPromise = pageToken ? Promise.resolve(null) : youtubeService.getVideoStats(videoId, apiKey);
        const commentsPromise = youtubeService.getVideoComments(videoId, apiKey, pageToken);

        const [videoData, commentsResponse] = await Promise.all([
            videoDataPromise,
            commentsPromise
        ]);

        let stats = null;
        if (videoData) {
            stats = {
                title: videoData.snippet.title,
                description: videoData.snippet.description,
                thumbnails: videoData.snippet.thumbnails,
                viewCount: videoData.statistics.viewCount,
                likeCount: videoData.statistics.likeCount,
                commentCount: videoData.statistics.commentCount,
            };
        }

        const comments = commentsResponse.items.map((thread: any) => ({
            id: thread.id,
            text: thread.snippet.topLevelComment.snippet.textDisplay,
            author: thread.snippet.topLevelComment.snippet.authorDisplayName,
            likeCount: thread.snippet.topLevelComment.snippet.likeCount,
            publishedAt: thread.snippet.topLevelComment.snippet.publishedAt,
        }));

        res.json({
            status: 'success',
            data: {
                stats: stats || undefined,
                comments,
                nextPageToken: commentsResponse.nextPageToken
            }
        });
    } catch (error) {
        next(error);
    }
};
