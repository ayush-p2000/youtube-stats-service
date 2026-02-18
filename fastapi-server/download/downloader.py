"""
Pure-Python yt-dlp wrapper for format listing and video downloading.
Based on the user's tested CLI implementation — uses subprocess for
maximum compatibility with any yt-dlp version.
"""

import os
import re
import json
import subprocess
import sys
import tempfile
import time
from typing import Optional, Callable

from download.job_store import job_store
from download.schemas import FormatOption


# ── Constants ─────────────────────────────────────────────

SABR_BLOCKED_FORMAT_IDS = {
    "394", "395", "396", "397", "398", "399",   # AV1 144p–1080p
    "330", "331", "332", "333", "334", "335",   # AV1 HDR
    "694", "695", "696", "697", "698", "699",   # AV1 HDR alt
}

BASE_ARGS = [
    "--no-playlist",
    "--js-runtimes", "node",
    "--impersonate", "chrome",
    "--extractor-args", "youtube:player-client=web,web_safari,android_vr"
]


# ── Helpers ───────────────────────────────────────────────

def _sanitize_filename(name: str) -> str:
    """Remove characters unsafe for file names."""
    cleaned = re.sub(r'[\\/:*?"<>|]+', '', name).strip()
    return cleaned or "video"


def _sanitize_ext(ext: str) -> Optional[str]:
    normalized = ext.lower().strip()
    if not re.match(r'^[a-z0-9]{1,5}$', normalized):
        return None
    return normalized


def _yt_dlp_cmd() -> list[str]:
    """Return the yt-dlp command as a list — uses python -m yt_dlp for reliability."""
    return [sys.executable, "-m", "yt_dlp"]


def _format_bitrate(bitrate: Optional[int]) -> Optional[str]:
    if not bitrate:
        return None
    if bitrate >= 1_000_000:
        return f"{bitrate / 1_000_000:.1f} Mbps"
    if bitrate >= 1_000:
        return f"{bitrate / 1_000:.0f} kbps"
    return f"{bitrate} bps"


def _extract_quality(resolution: Optional[str], note: Optional[str]) -> Optional[str]:
    if resolution:
        return resolution
    if note:
        m = re.search(r'(\d+p?)', note, re.IGNORECASE)
        if m:
            val = m.group(1)
            return val.lower() if val.lower().endswith('p') else f"{val}p"
    return None


def check_ffmpeg() -> bool:
    """Check if ffmpeg is available."""
    try:
        r = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True, text=True,
            timeout=5,
        )
        return r.returncode == 0
    except Exception:
        return False


# ── Format Listing ────────────────────────────────────────

def list_formats(url: str) -> dict:
    """
    Fetch available formats for a video URL using `yt-dlp --dump-single-json`.
    Returns a dict matching the existing client API contract:
      {formats, availableOptions, ffmpegAvailable, canMerge}
    """
    args = _yt_dlp_cmd() + ["--dump-single-json", "--skip-download",
            "--no-playlist", "--quiet", url]

    result = subprocess.run(args, capture_output=True, text=True, timeout=60)

    if result.returncode != 0:
        err_msg = result.stderr.strip() or "unknown error"
        print(f"DEBUG: yt-dlp list_formats failed for {url}. Error: {err_msg}")
        raise RuntimeError(f"yt-dlp failed: {err_msg}")

    info = json.loads(result.stdout)
    raw_formats = info.get("formats", [])

    # Filter to video formats (has a video codec, not storyboards)
    video_formats = [
        f for f in raw_formats
        if f.get("vcodec") and f["vcodec"] != "none" and f.get("ext")
    ]

    options: list[FormatOption] = []
    for f in video_formats:
        height = f.get("height")
        resolution = f"{height}p" if height else None
        quality = _extract_quality(resolution, f.get("format_note"))

        # Compute bitrate in bps (yt-dlp reports tbr/vbr in kbps)
        tbr = f.get("tbr")
        vbr = f.get("vbr")
        bitrate = int(tbr * 1000) if tbr else (int(vbr * 1000) if vbr else None)

        has_audio = bool(f.get("acodec") and f["acodec"] != "none")

        options.append(FormatOption(
            format_id=f.get("format_id", ""),
            ext=f.get("ext", ""),
            resolution=resolution,
            quality=quality,
            bitrate=bitrate,
            fps=f.get("fps"),
            note=f.get("format_note"),
            filesize=f.get("filesize") or f.get("filesize_approx"),
            hasAudio=has_audio,
        ))

    # Build unique option lists for the client filter dropdowns
    unique_exts = sorted(set(o.ext for o in options if o.ext))
    unique_qualities = sorted(
        set(o.quality for o in options if o.quality),
        key=lambda q: int(q.replace('p', '') or '0'),
        reverse=True,
    )
    unique_bitrates_raw = sorted(
        set(o.bitrate for o in options if o.bitrate is not None),
        reverse=True,
    )
    unique_bitrates = [b for b in (_format_bitrate(b) for b in unique_bitrates_raw) if b]

    ffmpeg_available = check_ffmpeg()

    return {
        "status": "success",
        "formats": [o.model_dump() for o in options],
        "availableOptions": {
            "formats": unique_exts,
            "qualities": unique_qualities,
            "bitrates": unique_bitrates,
        },
        "ffmpegAvailable": ffmpeg_available,
        "canMerge": ffmpeg_available,
    }


# ── Download ──────────────────────────────────────────────

def _build_download_args(
    url: str,
    output_path: str,
    format_id: Optional[str] = None,
    quality: Optional[str] = None,
    ext: Optional[str] = None,
    bitrate: Optional[str] = None,
    merge_ext: Optional[str] = None,
) -> list[str]:
    """Build yt-dlp argument list for downloading."""
    args: list[str] = list(BASE_ARGS)
    args += ["-o", output_path]

    if format_id:
        args += ["-f", format_id]
        # Always specify merge format for proper container metadata
        if merge_ext:
            args += ["--merge-output-format", merge_ext]
    elif quality:
        height = quality.replace("p", "")
        if ext:
            fmt_sel = (
                f"bestvideo[height<={height}][ext={ext}][vcodec^=avc]"
                f"+bestaudio[ext=m4a]"
                f"/bestvideo[height<={height}][ext={ext}]+bestaudio"
                f"/bestvideo[height<={height}]+bestaudio"
                f"/best[height<={height}]"
                f"/best"
            )
        else:
            fmt_sel = (
                f"bestvideo[height<={height}][ext=mp4][vcodec^=avc]"
                f"+bestaudio[ext=m4a]"
                f"/bestvideo[height<={height}]+bestaudio"
                f"/best[height<={height}]"
                f"/best"
            )
        args += ["-f", fmt_sel]
        args += ["--merge-output-format", ext or "mp4"]
    else:
        # Safe default: best H.264 mp4 — avoids SABR-blocked AV1
        args += [
            "-f",
            "bestvideo[ext=mp4][vcodec^=avc]+bestaudio[ext=m4a]"
            "/bestvideo[ext=mp4]+bestaudio[ext=m4a]"
            "/bestvideo+bestaudio"
            "/best",
        ]
        args += ["--merge-output-format", "mp4"]

    args.append("--newline")
    args.append(url)
    return args


def run_download(job_id: str, url: str,
                 format_ext: Optional[str] = None,
                 format_id: Optional[str] = None,
                 quality: Optional[str] = None,
                 bitrate: Optional[str] = None) -> None:
    """
    Execute yt-dlp download in the current thread (meant to be called
    via asyncio.to_thread from the endpoint).  Updates job_store with
    real-time progress.
    """
    try:
        job_store.update_job(job_id, status="processing",
                             stage="Fetching video info...", progress=5)

        # ── Fetch video metadata ──────────────────────────
        meta_args = _yt_dlp_cmd() + ["--dump-single-json", "--skip-download",
                     "--no-playlist", "--quiet", url]
        meta_result = subprocess.run(meta_args, capture_output=True,
                                     text=True, timeout=60)
        if meta_result.returncode != 0:
            raise RuntimeError(f"yt-dlp metadata failed: {meta_result.stderr.strip()}")

        info = json.loads(meta_result.stdout)
        title = _sanitize_filename(info.get("title", "video"))
        raw_formats = info.get("formats", [])

        # Determine output extension
        ext = "mp4"
        if format_id:
            matched = next((f for f in raw_formats if f.get("format_id") == format_id), None)
            if matched and matched.get("ext"):
                ext = matched["ext"].lower()
            # Check if the selected format is video-only
            is_video_only = matched and (
                matched.get("acodec") == "none" or
                matched.get("audio_ext") == "none"
            )
            # If video-only, use format_id+bestaudio so yt-dlp merges them
            if is_video_only:
                format_id = f"{format_id}+bestaudio"
                ext = "mp4"  # merged output
        elif format_ext:
            ext = _sanitize_ext(format_ext) or "mp4"

        job_store.update_job(job_id, stage="Selecting format...", progress=10)

        # ── Build output path ─────────────────────────────
        tmp_dir = tempfile.gettempdir()
        output_path = os.path.join(tmp_dir, f"{title}_{int(time.time())}.{ext}")

        # ── Run yt-dlp download ───────────────────────────
        dl_args = _yt_dlp_cmd() + _build_download_args(
            url, output_path,
            format_id=format_id,
            quality=quality,
            ext=format_ext,
            bitrate=bitrate,
            merge_ext=ext,
        )

        job_store.update_job(job_id, stage="Starting download...", progress=15)

        process = subprocess.Popen(
            dl_args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )

        last_progress = 15

        if process.stdout:
            for line in process.stdout:
                line = line.rstrip()
                # Parse progress: [download]  12.3% of ...
                match = re.search(r'\[download\]\s+(\d+\.?\d*)%', line)
                if match:
                    pct = float(match.group(1))
                    # Map 0-100% download to 15-95% overall
                    mapped = int(15 + pct * 0.80)
                    if mapped > last_progress:
                        last_progress = mapped
                        job_store.update_job(
                            job_id,
                            stage=f"Downloading: {int(pct)}%",
                            progress=min(95, mapped),
                        )

        # Drain stderr (warnings etc.)
        stderr_out = ""
        if process.stderr:
            stderr_out = process.stderr.read()

        process.wait()

        if process.returncode != 0:
            raise RuntimeError(
                f"yt-dlp exited with code {process.returncode}. {stderr_out[-500:]}"
            )

        # Verify file exists (yt-dlp may have changed extension after merge)
        final_path = output_path
        if not os.path.exists(final_path):
            # yt-dlp sometimes appends or changes the extension after merge
            # Look for the file with the expected title prefix
            parent = os.path.dirname(output_path)
            prefix = os.path.splitext(os.path.basename(output_path))[0]
            for fname in os.listdir(parent):
                if fname.startswith(prefix):
                    final_path = os.path.join(parent, fname)
                    ext = os.path.splitext(fname)[1].lstrip(".")
                    break

        if not os.path.exists(final_path):
            raise RuntimeError("Downloaded file not found after yt-dlp completed")

        job_store.update_job(
            job_id,
            status="completed",
            progress=100,
            stage="Ready for download",
            file_path=final_path,
            filename=f"{title}.{ext}",
        )

    except Exception as exc:
        job_store.update_job(
            job_id,
            status="failed",
            error=str(exc),
        )
