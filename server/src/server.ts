import dotenv from 'dotenv';
import app from './app.js';
import { spawnSync } from 'node:child_process';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['YOUTUBE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar] || process.env[envVar] === '');

if (missingEnvVars.length > 0 && process.env.USE_MOCK_DATA !== 'true') {
    console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
    console.warn('Set USE_MOCK_DATA=true to use mock data, or provide valid API keys');
}

// Trust reverse proxy (needed for rate limiting and deployment behind proxies)
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'undefined'}`);
    if (process.env.USE_MOCK_DATA === 'true') {
        console.log('Using MOCK_DATA mode');
    }
    const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { encoding: 'utf-8' });
    const ffprobeCheck = spawnSync('ffprobe', ['-version'], { encoding: 'utf-8' });
    if (ffmpegCheck.status !== 0 || ffprobeCheck.status !== 0) {
        console.warn('ffmpeg/ffprobe not detected in PATH. High-resolution merging may be unavailable.');
    }
});

// Graceful shutdown
const shutdown = (signal: string) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
    // Force exit if not closed within timeout
    setTimeout(() => {
        console.error('Force exiting after timeout');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
