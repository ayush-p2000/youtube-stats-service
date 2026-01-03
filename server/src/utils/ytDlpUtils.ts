import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const YT_DLP_PATH = path.resolve(__dirname, '../../node_modules/yt-dlp-exec/bin/yt-dlp.exe');

interface YtDlpOptions {
    format?: string;
    output?: string;
    noPart?: boolean;
    jsRuntimes?: string;
    noPlaylist?: boolean;
    progress?: boolean;
    newline?: boolean;
    quiet?: boolean;
}

/**
 * Runs yt-dlp using spawn to capture granular progress updates.
 */
export const runYtDlpWithProgress = (
    url: string,
    options: YtDlpOptions,
    onProgress?: (percent: number) => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const args = [url];

        if (options.format) args.push('-f', options.format);
        if (options.output) args.push('-o', options.output);
        if (options.noPart) args.push('--no-part');
        if (options.noPlaylist) args.push('--no-playlist');
        if (options.progress) args.push('--newline', '--progress');
        if (options.quiet) args.push('--quiet');

        // Note: yt-dlp-exec sometimes uses internal flags, but these are the standard ones.

        const child = spawn(YT_DLP_PATH, args);

        let stderr = '';

        child.stdout.on('data', (data) => {
            const output = data.toString();
            // yt-dlp progress format: [download]  12.3% of ...
            const match = output.match(/\[download\]\s+(\d+\.?\d*)%/);
            if (match && onProgress) {
                const percent = parseFloat(match[1]);
                onProgress(percent);
            }
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`yt-dlp exited with code ${code}. ${stderr}`));
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
};
