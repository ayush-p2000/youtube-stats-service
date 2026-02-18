"""
Pydantic models for download & format endpoints.
Matches the existing client-side TypeScript interfaces exactly.
"""

from pydantic import BaseModel
from typing import Optional


# ── Requests ──────────────────────────────────────────────

class FormatRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format: Optional[str] = None       # file extension: mp4, webm, etc.
    format_id: Optional[str] = None    # yt-dlp format ID e.g. "137"
    quality: Optional[str] = None      # resolution string e.g. "1080p"
    bitrate: Optional[str] = None      # e.g. "1.2 Mbps" or "809 kbps"


# ── Format listing response models ───────────────────────

class FormatOption(BaseModel):
    format_id: str
    ext: str
    resolution: Optional[str] = None
    quality: Optional[str] = None
    bitrate: Optional[int] = None      # in bps
    fps: Optional[int] = None
    note: Optional[str] = None
    filesize: Optional[int] = None
    hasAudio: bool = False


class AvailableOptions(BaseModel):
    formats: list[str] = []
    qualities: list[str] = []
    bitrates: list[str] = []
