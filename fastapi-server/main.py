"""
YouTube Stats Service — FastAPI Microservice

Handles:
  - ML endpoints: sentiment analysis, predictive analytics, earnings
  - Download endpoints: format listing, video downloads (via yt-dlp)

The TS server on Vercel handles URL parsing and YouTube API stats.
"""

import asyncio
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from datetime import datetime

from config import settings
from ml.sentiment import analyze_sentiment_and_topics
from ml.prediction import run_predictive_analytics
from ml.earnings import calculate_earnings_data
from models.schemas import (
    SentimentRequest,
    PredictionRequest,
    EarningsRequest,
)
from download.schemas import FormatRequest, DownloadRequest
from download.job_store import job_store
from download.downloader import list_formats, run_download

app = FastAPI(
    title="YouTube Stats Service — API",
    version="2.0.0",
    description="Python microservice for ML analytics and video downloads.",
)

# ── CORS ──────────────────────────────────────────────────

origins = settings.CORS_ORIGIN.split(",") if settings.CORS_ORIGIN != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "YouTube Stats Service API",
        "version": "2.0.0",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Server is running"}


# ── Sentiment Analysis ───────────────────────────────────

@app.post("/api/analyze-sentiment")
async def analyze_sentiment(request: SentimentRequest):
    if not request.comments or len(request.comments) == 0:
        raise HTTPException(status_code=400, detail="No comments provided for analysis")

    try:
        analysis = analyze_sentiment_and_topics(request.comments)
        return {"status": "success", "data": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sentiment analysis failed: {str(e)}")


# ── Predictive Analytics ─────────────────────────────────

@app.post("/api/predict/{video_id}")
async def predict(video_id: str, request: PredictionRequest):
    if not video_id:
        raise HTTPException(status_code=400, detail="Video ID is required")

    try:
        stats_dict = request.stats.model_dump()
        prediction = run_predictive_analytics(
            stats=stats_dict,
            sentiment=request.sentiment,
            comments=request.comments,
            timestamp=datetime.now().isoformat(),
        )
        return {"status": "success", "data": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ── Earnings Prediction ──────────────────────────────────

@app.post("/api/earnings/{video_id}")
async def earnings(video_id: str, request: EarningsRequest):
    if not video_id:
        raise HTTPException(status_code=400, detail="Video ID is required")

    try:
        stats_dict = request.stats.model_dump()
        earnings_data = calculate_earnings_data(
            stats=stats_dict,
            sentiment=request.sentiment,
            comments=request.comments,
        )
        return {"status": "success", "data": earnings_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Earnings prediction failed: {str(e)}")


# ── Format Listing ────────────────────────────────────────

@app.post("/api/formats")
async def get_formats(request: FormatRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        result = await asyncio.to_thread(list_formats, request.url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list formats: {str(e)}")


# ── Download: Initiate ────────────────────────────────────

@app.post("/api/download/init")
async def initiate_download(request: DownloadRequest):
    if not request.url:
        raise HTTPException(status_code=400, detail="URL is required")

    job_id = job_store.create_job()

    # Launch download in background thread (non-blocking)
    asyncio.get_event_loop().run_in_executor(
        None,
        run_download,
        job_id,
        request.url,
        request.format,
        request.format_id,
        request.quality,
        request.bitrate,
    )

    return {"status": "ok", "jobId": job_id}


# ── Download: Poll Status ─────────────────────────────────

@app.get("/api/download/status/{job_id}")
async def download_status(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "status": "ok",
        "job": {
            "id": job.id,
            "status": job.status,
            "progress": job.progress,
            "stage": job.stage,
            "error": job.error,
        },
    }


# ── Download: Serve File ──────────────────────────────────

@app.get("/api/download/file/{job_id}")
async def download_file(job_id: str):
    job = job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != "completed" or not job.file_path:
        raise HTTPException(status_code=400, detail="Download not ready")
    if not os.path.exists(job.file_path):
        raise HTTPException(status_code=500, detail="File expired or deleted")

    ext = os.path.splitext(job.filename or "video")[1].lstrip(".")
    media_types = {
        "mp4": "video/mp4",
        "webm": "video/webm",
        "3gp": "video/3gpp",
        "m4a": "audio/mp4",
        "mp3": "audio/mpeg",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    file_path = job.file_path

    def cleanup() -> None:
        try:
            os.unlink(file_path)
        except OSError:
            pass

    return FileResponse(
        path=file_path,
        filename=job.filename or f"video.{ext}",
        media_type=media_type,
        background=BackgroundTask(cleanup),
    )


# ── Run with uvicorn ──────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
