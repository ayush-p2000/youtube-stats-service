import axios from 'axios';

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const getVideoStats = async (videoId: string, apiKey: string) => {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
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

export const getVideoComments = async (videoId: string, apiKey: string, pageToken?: string) => {
    const response: any = await axios.get(`${YOUTUBE_API_BASE_URL}/commentThreads`, {
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
        nextPageToken: response.data.nextPageToken,
    };
};
