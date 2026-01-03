import type { Request, Response, NextFunction } from 'express';
import * as youtubeService from '../services/youtubeService.js';
import { MOCK_VIDEO_STATS, MOCK_COMMENTS_RESPONSE } from '../utils/mockYoutubeData.js';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { videoId } = req.params;
        const pageToken = req.query.pageToken as string | undefined;
        // Check for API key in query (common for GET) or fallback to env
        let apiKey = (req.query.apiKey as string) || process.env.YOUTUBE_API_KEY;
        console.log('apiKey', apiKey)

        if (!videoId) {
            res.status(400).json({ status: 'error', message: 'Could not parse Video ID' });
            return;
        }

        if (!apiKey) {
            // Check if we can proceed with limited functionality or just mock
            if (process.env.USE_MOCK_DATA === 'true') {
                apiKey = 'MOCK';
            } else {
                // Return 200 OK but with 'limited' status to trigger Download Only mode on frontend
                res.status(200).json({
                    status: 'limited',
                    message: 'API Key Required for full stats',
                    data: {
                        stats: null,
                        comments: [],
                        videoId
                    }
                });
                return;
            }
        }

        // Mock data logic
        const useMock = process.env.USE_MOCK_DATA === 'true' || apiKey === 'MOCK';

        let videoData, commentsResponse;

        if (useMock) {
            console.log('Using Mock YouTube Data for stats');
            videoData = MOCK_VIDEO_STATS;
            commentsResponse = pageToken ? { items: [], nextPageToken: null } : MOCK_COMMENTS_RESPONSE;
        } else {
            const videoDataPromise = pageToken ? Promise.resolve(null) : youtubeService.getVideoStats(videoId, apiKey);
            let commentsPromise: Promise<any>;
            commentsPromise = youtubeService.getVideoComments(videoId, apiKey, pageToken).catch((err: any) => {
                const msg = typeof err?.response?.data?.error?.message === 'string' ? err.response.data.error.message : '';
                if (err?.response?.status === 403 && msg.toLowerCase().includes('disabled comments')) {
                    return { items: [], nextPageToken: undefined };
                }
                throw err;
            });
            [videoData, commentsResponse] = await Promise.all([videoDataPromise, commentsPromise]);
        }

        let stats = null;
        if (videoData) {
            stats = {
                title: videoData.snippet.title,
                description: videoData.snippet.description,
                thumbnails: videoData.snippet.thumbnails,
                viewCount: videoData.statistics.viewCount,
                likeCount: videoData.statistics.likeCount,
                commentCount: videoData.statistics.commentCount,
                publishedAt: videoData.snippet.publishedAt,
            };
        }

        interface CommentThread {
            id: string;
            snippet: {
                topLevelComment: {
                    snippet: {
                        textDisplay: string;
                        authorDisplayName: string;
                        likeCount: number;
                        publishedAt: string;
                    };
                };
            };
        }

        const comments = (commentsResponse.items as CommentThread[]).map((thread) => ({
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
