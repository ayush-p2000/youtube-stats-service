import { Router } from 'express';
import { parseUrl } from '../controllers/urlController.js';
import { getStats } from '../controllers/statsController.js';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

router.post('/parse-url', parseUrl);
router.get('/stats/:videoId', getStats);
// ML endpoints (sentiment, predict, earnings) → FastAPI server
// Download/format endpoints → FastAPI server

export default router;
