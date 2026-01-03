# FFmpeg Integration for Video/Audio Merging

## Overview

The download system now supports downloading video and audio separately and merging them using FFmpeg. This allows users to download high-quality video-only formats (like 1080p, 4K) and automatically merge them with the best available audio track.

## How It Works

1. **Format Detection**: When a user selects a format, the system checks if it has audio (`hasAudio: false`)
2. **Automatic Merging**: If the format is video-only and FFmpeg is available:
   - Downloads the selected video format using yt-dlp
   - Downloads the best available audio track
   - Merges them using FFmpeg
   - Streams the merged file to the user
   - Cleans up temporary files

3. **Fallback**: If FFmpeg is not available:
   - Returns an error message asking user to install FFmpeg
   - Or falls back to formats that have audio (if available)

## Benefits

- ✅ Download high-quality video-only formats (1080p, 4K, etc.)
- ✅ Automatically merge with best audio quality
- ✅ Better quality than pre-merged formats
- ✅ No manual intervention required

## Requirements

- **FFmpeg**: Must be installed and available in system PATH
- **yt-dlp**: Already included in the project

## Installation

### Windows
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract and add to PATH, or place `ffmpeg.exe` in a folder in PATH
3. Verify: `ffmpeg -version`

### Mac
```bash
brew install ffmpeg
```

### Linux
```bash
sudo apt-get install ffmpeg  # Debian/Ubuntu
sudo yum install ffmpeg      # CentOS/RHEL
```

## API Changes

### Formats Endpoint Response

The `/api/formats` endpoint now includes:
```json
{
    "status": "success",
    "formats": [...],
    "availableOptions": {...},
    "ffmpegAvailable": true,
    "canMerge": true
}
```

### Download Endpoint

The `/api/download` endpoint automatically:
- Detects video-only formats
- Merges with audio if FFmpeg is available
- Returns merged file

No changes to request payload needed!

## Example Flow

1. User selects: Format=MP4, Quality=1080p, Bitrate=378 kbps
2. System identifies format_id "399" (video-only, 1080p)
3. System downloads:
   - Video: format_id 399 (1080p video, no audio)
   - Audio: best available audio track
4. FFmpeg merges video + audio
5. User receives merged 1080p MP4 file with audio

## Code Structure

- `server/src/utils/ffmpegMerger.ts`: FFmpeg merging utilities
  - `checkFFmpeg()`: Checks if FFmpeg is available
  - `mergeVideoAudio()`: Merges video and audio files
  - `downloadAndMerge()`: Downloads and merges in one step

- `server/src/controllers/downloadController.ts`: Updated to use merging
  - Detects video-only formats
  - Calls merging utility when needed
  - Handles errors gracefully

## Testing

Test with a video-only format:
```json
POST /api/download
{
    "url": "YOUR_VIDEO_URL",
    "format_id": "399"  // Video-only format
}
```

Expected behavior:
- Downloads video format 399
- Downloads best audio
- Merges them
- Returns merged file

## Troubleshooting

### FFmpeg not found
- Error: "Format X is video-only and requires ffmpeg for audio merging"
- Solution: Install FFmpeg and ensure it's in PATH

### Merge fails
- Check FFmpeg installation: `ffmpeg -version`
- Check disk space (temporary files are created)
- Check file permissions

### Slow merging
- Merging can take time for large files
- Progress is logged to console
- Consider showing progress to user in future updates



