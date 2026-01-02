import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SentimentAnalysisResult {
    positive: number;
    negative: number;
    neutral: number;
    average_polarity: number;
    total: number;
    topics: { name: string; count: number }[];
    // Advanced sentiment fields
    emotions: {
        joy: number;
        anger: number;
        sadness: number;
        surprise: number;
        fear: number;
        excitement: number;
    };
    spam_count: number;
    spam_comments: string[];
    sarcasm_detected: number;
    error?: string;
}

interface PredictiveAnalyticsResult {
    virality_score: number;
    forecast: {
        views_7d: number;
        views_30d: number;
        likes_7d: number;
        likes_30d: number;
        growth_trend: string;
    };
    recommendations: string[];
    analysis_timestamp?: string;
    error?: string;
}

export const analyzeCommentsSentiment = (comments: string[]): Promise<SentimentAnalysisResult> => {
    return new Promise((resolve, reject) => {
        if (!comments || comments.length === 0) {
            reject(new Error('No comments provided for analysis'));
            return;
        }

        const pythonScriptPath = path.join(__dirname, '../ml/sentiment_analysis.py');
        const pythonProcess = spawn('python', [pythonScriptPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process. Make sure Python is installed and textblob is available: ${err.message}`));
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${error || 'Unknown error'}`));
                return;
            }

            if (!result.trim()) {
                reject(new Error('Python process returned no output'));
                return;
            }

            try {
                const parsed = JSON.parse(result);
                if (parsed.error) {
                    reject(new Error(`Python script error: ${parsed.error}`));
                    return;
                }
                resolve(parsed);
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${result}. Error: ${e instanceof Error ? e.message : 'Unknown parsing error'}`));
            }
        });

        // Write comments as JSON to stdin
        try {
            const inputData = JSON.stringify(comments);
            pythonProcess.stdin.write(inputData);
            pythonProcess.stdin.end();
        } catch (err) {
            pythonProcess.kill();
            reject(new Error(`Failed to write to Python process: ${err instanceof Error ? err.message : 'Unknown error'}`));
        }
    });
};

export const runPredictiveAnalytics = (stats: any, sentiment?: any, comments?: any[]): Promise<PredictiveAnalyticsResult> => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, '../ml/predictive_analytics.py');
        const pythonProcess = spawn('python', [pythonScriptPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => { result += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { error += data.toString(); });
        pythonProcess.on('error', (err) => {
            reject(new Error(`Failed to start Python process: ${err.message}`));
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}: ${error || 'Unknown error'}`));
                return;
            }
            try {
                const parsed = JSON.parse(result);
                if (parsed.error) {
                    reject(new Error(`Python script error: ${parsed.error}`));
                    return;
                }
                resolve(parsed);
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${result}`));
            }
        });

        try {
            const inputData = JSON.stringify({ stats, sentiment, comments, timestamp: new Date().toISOString() });
            pythonProcess.stdin.write(inputData);
            pythonProcess.stdin.end();
        } catch (err) {
            pythonProcess.kill();
            reject(new Error('Failed to write to Python process'));
        }
    });
};
