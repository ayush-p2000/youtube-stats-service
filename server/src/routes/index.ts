import { Router } from 'express';
import { parseUrl } from '../controllers/urlController.js';
import { getStats } from '../controllers/statsController.js';
import { analyzeSentiment } from '../controllers/sentimentController.js';
import { getPredictiveAnalytics } from '../controllers/predictionController.js';
import { getEarningsPrediction } from '../controllers/earningsController.js';
import { initiateDownload, checkDownloadStatus, serveDownloadFile } from '../controllers/downloadController.js';
import { listFormats } from '../controllers/formatsController.js';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

router.post('/parse-url', parseUrl);
router.get('/stats/:videoId', getStats);
router.post('/analyze-sentiment', analyzeSentiment);
router.post('/predict/:videoId', getPredictiveAnalytics);
router.post('/earnings/:videoId', getEarningsPrediction);
// router.post('/download', downloadVideo); // Deprecated
router.post('/download/init', initiateDownload);
router.get('/download/status/:jobId', checkDownloadStatus);
router.get('/download/file/:jobId', serveDownloadFile);
router.post('/formats', listFormats);

export default router;
