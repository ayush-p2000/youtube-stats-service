import type { Request, Response, NextFunction } from 'express';
import type { AxiosError } from 'axios';

interface YouTubeApiError {
    error?: {
        errors?: Array<{ reason?: string }>;
        message?: string;
    };
}

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    // Ensure we have an Error object
    const error = err instanceof Error ? err : new Error('Unknown error occurred');
    
    console.error('Error Stack:', error.stack);

    let message = error.message || 'Internal Server Error';
    let statusCode = 500;

    // Handle Axios errors (YouTube API errors)
    if (err && typeof err === 'object' && 'isAxiosError' in err && err.isAxiosError) {
        const axiosError = err as AxiosError<YouTubeApiError>;
        
        if (axiosError.response) {
            const apiError = axiosError.response.data;
            console.error('YouTube API Error Response:', JSON.stringify(apiError, null, 2));

            // Detect quota errors
            if (apiError?.error?.errors?.some((e) => e.reason === 'quotaExceeded')) {
                message = 'YouTube API quota exceeded. Please try again later or tomorrow.';
                statusCode = 429; // Too Many Requests
            } else if (apiError?.error?.message) {
                message = `YouTube API Error: ${apiError.error.message}`;
                statusCode = axiosError.response.status || 500;
            } else {
                statusCode = axiosError.response.status || 500;
            }
        } else if (axiosError.request) {
            message = 'Failed to connect to YouTube API. Please check your internet connection.';
            statusCode = 503; // Service Unavailable
        }
    }

    // Don't send error details in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal Server Error';
    }

    res.status(statusCode).json({
        status: 'error',
        message
    });
};
