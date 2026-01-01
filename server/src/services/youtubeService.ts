import axios from 'axios';
import type { AxiosResponse } from 'axios';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface VideoStatsResponse {
    items: Array<{
        snippet: {
            title: string;
            description: string;
            thumbnails: Record<string, { url: string }>;
            publishedAt: string;
        };
        statistics: {
            viewCount: string;
            likeCount: string;
            commentCount: string;
        };
    }>;
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

interface CommentsResponse {
    items: CommentThread[];
    nextPageToken?: string;
}

export const getVideoStats = async (videoId: string, apiKey: string) => {
    const response: AxiosResponse<VideoStatsResponse> = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
            part: 'statistics,snippet',
            id: videoId,
            key: apiKey,
        },
    });

    if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
    }

    return response.data.items[0];
};

export const getVideoComments = async (videoId: string, apiKey: string, pageToken?: string): Promise<CommentsResponse> => {
    const response: AxiosResponse<CommentsResponse> = await axios.get(`${YOUTUBE_API_BASE_URL}/commentThreads`, {
        params: {
            part: 'snippet',
            videoId: videoId,
            maxResults: 100, // Max for a single request
            textFormat: 'plainText',
            key: apiKey,
            pageToken: pageToken,
        },
    });

    return {
        items: response.data.items || [],
        ...(response.data.nextPageToken && { nextPageToken: response.data.nextPageToken }),
    };
};

export const getAllVideoComments = async (videoId: string, apiKey: string): Promise<CommentThread[]> => {
    let allComments: CommentThread[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 100; // Safety limit to prevent infinite loops

    do {
        if (pageCount >= MAX_PAGES) {
            console.warn(`Reached maximum page limit (${MAX_PAGES}) for comments. Stopping pagination.`);
            break;
        }

        const response: AxiosResponse<CommentsResponse> = await axios.get(`${YOUTUBE_API_BASE_URL}/commentThreads`, {
            params: {
                part: 'snippet',
                videoId: videoId,
                maxResults: 100,
                textFormat: 'plainText',
                key: apiKey,
                pageToken: nextPageToken,
            },
        });

        allComments = [...allComments, ...(response.data.items || [])];
        nextPageToken = response.data.nextPageToken;
        pageCount++;
    } while (nextPageToken);

    return allComments;
};
