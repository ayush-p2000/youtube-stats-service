import { spawn, spawnSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ytDlp from 'yt-dlp-exec';
import { runYtDlpWithProgress } from './ytDlpUtils.js';

interface MergeOptions {
    videoPath: string;
    audioPath: string;
    outputPath: string;
    onProgress?: (progress: number) => void;
}

/**
 * Check if ffmpeg is available in the system
 */
export const checkFFmpeg = (): boolean => {
    try {
        const result = spawnSync('ffmpeg', ['-version'], {
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        return result.status === 0;
    } catch {
        return false;
    }
};

/**
 * Merge video and audio files using ffmpeg
 */
export const mergeVideoAudio = (options: MergeOptions): Promise<void> => {
    return new Promise((resolve, reject) => {
        const { videoPath, audioPath, outputPath, onProgress } = options;

        // Check if input files exist
        if (!fs.existsSync(videoPath)) {
            reject(new Error(`Video file not found: ${videoPath}`));
            return;
        }
        if (!fs.existsSync(audioPath)) {
            reject(new Error(`Audio file not found: ${audioPath}`));
            return;
        }

        // FFmpeg command to merge video and audio
        // -i video: input video file
        // -i audio: input audio file
        // -c:v copy: copy video codec (no re-encoding, faster)
        // -c:a aac: encode audio to AAC (compatible format)
        // -shortest: finish encoding when the shortest input stream ends
        // -y: overwrite output file if it exists
        const args = [
            '-i', videoPath,
            '-i', audioPath,
            '-c:v', 'copy',  // Copy video stream (no re-encoding)
            '-c:a', 'aac',   // Encode audio to AAC
            '-b:a', '192k',  // Audio bitrate
            '-shortest',     // Use shortest stream duration
            '-y',            // Overwrite output file
            outputPath
        ];

        const ffmpeg = spawn('ffmpeg', args);

        let stderr = '';
        let duration: number | null = null;
        let currentTime: number | null = null;

        ffmpeg.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;

            // Parse duration from ffmpeg output
            if (!duration) {
                const durationMatch = output.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
                if (durationMatch) {
                    const hours = parseInt(durationMatch[1]);
                    const minutes = parseInt(durationMatch[2]);
                    const seconds = parseInt(durationMatch[3]);
                    const centiseconds = parseInt(durationMatch[4]);
                    duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
                }
            }

            // Parse current time and calculate progress
            const timeMatch = output.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
            if (timeMatch && duration) {
                const hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const seconds = parseInt(timeMatch[3]);
                const centiseconds = parseInt(timeMatch[4]);
                currentTime = hours * 3600 + minutes * 60 + seconds + centiseconds / 100;

                if (onProgress && duration > 0) {
                    const progress = Math.min(100, Math.round((currentTime / duration) * 100));
                    onProgress(progress);
                }
            }
        });

        ffmpeg.on('error', (error) => {
            reject(new Error(`FFmpeg error: ${error.message}`));
        });

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`FFmpeg process exited with code ${code}. Error: ${stderr.slice(-500)}`));
            }
        });
    });
};

/**
 * Download video and audio separately using yt-dlp, then merge them
 */
export const downloadAndMerge = async (
    url: string,
    videoFormatId: string,
    outputPath: string,
    onProgress?: (stage: string, progress?: number) => void
): Promise<void> => {
    const tmpDir = os.tmpdir();
    const videoPath = path.join(tmpDir, `video_${Date.now()}.mp4`);
    const audioPath = path.join(tmpDir, `audio_${Date.now()}.m4a`);

    try {
        // Download video
        onProgress?.('Downloading video...', 0);
        await downloadFormat(url, videoFormatId, videoPath, (progress) => {
            onProgress?.('Downloading video...', progress * 0.4); // 0-40%
        });

        // Download best audio
        onProgress?.('Downloading audio...', 40);
        await downloadBestAudio(url, audioPath, (progress) => {
            onProgress?.('Downloading audio...', 40 + progress * 0.2); // 40-60%
        });

        // Merge video and audio
        onProgress?.('Merging video and audio...', 60);
        await mergeVideoAudio({
            videoPath,
            audioPath,
            outputPath,
            onProgress: (progress) => {
                onProgress?.('Merging video and audio...', 60 + progress * 0.4); // 60-100%
            }
        });

        onProgress?.('Complete', 100);
    } finally {
        // Clean up temporary files
        [videoPath, audioPath].forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (err) {
                    console.warn(`Failed to delete temporary file ${file}:`, err);
                }
            }
        });
    }
};

/**
 * Download a specific format using yt-dlp
 */
const downloadFormat = async (
    url: string,
    formatId: string,
    outputPath: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
    try {
        await runYtDlpWithProgress(url, {
            format: formatId,
            output: outputPath,
            noPart: true,
            quiet: true,
            noPlaylist: true,
            progress: true,
        }, onProgress);
    } catch (err: any) {
        throw new Error(`Failed to download format ${formatId}: ${err.message}`);
    }
};

/**
 * Download best audio using yt-dlp
 */
const downloadBestAudio = async (
    url: string,
    outputPath: string,
    onProgress?: (progress: number) => void
): Promise<void> => {
    try {
        await runYtDlpWithProgress(url, {
            format: 'bestaudio[ext=m4a]/bestaudio/best',
            output: outputPath,
            noPart: true,
            quiet: true,
            noPlaylist: true,
            progress: true,
        }, onProgress);
    } catch (err: any) {
        throw new Error(`Failed to download audio: ${err.message}`);
    }
};

