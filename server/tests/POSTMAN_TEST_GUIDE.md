# Postman API Test Guide

## Base URL
```
http://localhost:5000
```

---

## 1. Health Check

**Endpoint:** `GET /api/health`

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/health`
- Headers: None required
- Body: None

**Expected Response:**
```json
{
    "status": "ok",
    "message": "Server is running"
}
```

---

## 2. Get Available Formats

**Endpoint:** `POST /api/formats`

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/formats`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Expected Response:**
```json
{
    "status": "success",
    "formats": [
        {
            "format_id": "399",
            "ext": "mp4",
            "resolution": "1080p",
            "quality": "1080p",
            "bitrate": 377524,
            "fps": 24,
            "note": "1080p",
            "filesize": 8787251,
            "hasAudio": false
        }
        // ... more formats
    ],
    "availableOptions": {
        "formats": ["mp4", "webm"],
        "qualities": ["1080p", "720p", "480p", "360p", "240p", "144p"],
        "bitrates": ["378 kbps", "348 kbps", "211 kbps", ...]
    },
    "ffmpegAvailable": true,
    "canMerge": true
}
```

**Note:** `ffmpegAvailable` and `canMerge` indicate if video-only formats can be automatically merged with audio.

---

## 3. Download Video - Using format_id (Recommended)

**Note:** If the format is video-only (hasAudio: false), the system will automatically:
1. Download the video format
2. Download the best audio track
3. Merge them using FFmpeg
4. Return the merged file

This allows downloading high-quality video-only formats like 1080p, 4K, etc.

**Endpoint:** `POST /api/download`

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/download`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format_id": "399"
}
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `video/mp4`
- Content-Disposition: `attachment; filename="Video Title.mp4"`
- Body: Binary video file (download in Postman)

---

## 4. Download Video - Using Format Only

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/download`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp4"
}
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `video/mp4`
- Body: Binary video file

---

## 5. Download Video - Using Format + Quality

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/download`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp4",
    "quality": "1080p"
}
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `video/mp4`
- Body: Binary video file

---

## 6. Download Video - Using Format + Quality + Bitrate

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/download`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp4",
    "quality": "1080p",
    "bitrate": "378 kbps"
}
```

**Expected Response:**
- Status: `200 OK`
- Content-Type: `video/mp4`
- Body: Binary video file

---

## 7. Download Video - Using All Parameters (format_id takes priority)

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/download`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format_id": "399",
    "format": "webm",
    "quality": "144p",
    "bitrate": "57 kbps"
}
```

**Note:** `format_id` takes highest priority, so other parameters are ignored.

**Expected Response:**
- Status: `200 OK`
- Content-Type: `video/mp4` (from format_id 399, not webm)
- Body: Binary video file

---

## 8. Parse URL (Extract Video ID)

**Endpoint:** `POST /api/parse-url`

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/parse-url`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (raw JSON):
```json
{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Expected Response:**
```json
{
    "status": "success",
    "videoId": "dQw4w9WgXcQ"
}
```

---

## Test Scenarios

### Scenario 1: Test Format 399 (1080p, 378 kbps)
```json
{
    "url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    "format_id": "399"
}
```

### Scenario 2: Test Format 18 (360p with audio)
```json
{
    "url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    "format_id": "18"
}
```

### Scenario 3: Test Filtering - MP4, 1080p, 378 kbps
```json
{
    "url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    "format": "mp4",
    "quality": "1080p",
    "bitrate": "378 kbps"
}
```

### Scenario 4: Test Error - Invalid format_id
```json
{
    "url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
    "format_id": "99999"
}
```

**Expected Response:**
```json
{
    "status": "error",
    "message": "Format ID 99999 not found for this video. Available format IDs: ..."
}
```

---

## Postman Collection Setup Tips

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:5000`
   - `test_video_url`: Your test YouTube URL
   - `format_id_1080p`: `399` (or the actual format_id from your video)

2. **For Download Requests:**
   - Set response type to "Save Response" or "Download"
   - The response will be a binary file

3. **Test Flow:**
   1. First call `/api/formats` to get available formats
   2. Note the `format_id` you want to test
   3. Call `/api/download` with that `format_id`
   4. Verify the downloaded file matches your selection

---

## Common Error Responses

### Invalid URL
```json
{
    "status": "error",
    "message": "Invalid YouTube URL"
}
```

### Format Not Found
```json
{
    "status": "error",
    "message": "Format ID 399 not found for this video. Available format IDs: ..."
}
```

### No Format Matches Criteria
```json
{
    "status": "error",
    "message": "No format matches the selected criteria"
}
```

---

## Quick Test Checklist

- [ ] Health check works
- [ ] Formats endpoint returns data
- [ ] Download with format_id works
- [ ] Download with format only works
- [ ] Download with format + quality works
- [ ] Download with format + quality + bitrate works
- [ ] format_id takes priority over other parameters
- [ ] Error handling works for invalid format_id
- [ ] Error handling works for invalid URL

