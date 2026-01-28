import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  // Custom keyGenerator for Vercel proxy compatibility
  keyGenerator: (req) => {
    // Vercel sets X-Forwarded-For header with the client IP
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // X-Forwarded-For can be a string or array, and may contain multiple IPs
      const ip = typeof forwarded === 'string' 
        ? forwarded.split(',')[0].trim() 
        : Array.isArray(forwarded) 
          ? forwarded[0]?.split(',')[0].trim() 
          : null;
      if (ip) return ip;
    }
    
    // Fallback to req.ip (works if trust proxy is set correctly)
    if (req.ip) return req.ip;
    
    // Last resort: use socket remote address or a fallback key
    return req.socket.remoteAddress || `fallback-${req.headers['user-agent'] || 'unknown'}`;
  },
});

app.use(limiter);
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'YouTube Stats Service API',
    version: '1.0.0'
  });
});

app.use('/api', router);
app.use(errorHandler);

export default app;
