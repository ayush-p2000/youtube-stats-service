import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['YOUTUBE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar] || process.env[envVar] === '');

if (missingEnvVars.length > 0 && process.env.USE_MOCK_DATA !== 'true') {
    console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
    console.warn('Set USE_MOCK_DATA=true to use mock data, or provide valid API keys');
}

// CORS configuration - allow all origins in development, should be restricted in production
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        message: 'YouTube Stats Service API',
        version: '1.0.0'
    });
});

app.use('/api', router);

// Error handler must be last middleware
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.USE_MOCK_DATA === 'true') {
        console.log('Using MOCK_DATA mode');
    }
});
