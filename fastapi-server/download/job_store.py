"""
In-memory download job store.
Port of the TS progressStore.ts — tracks background download jobs.
"""

import uuid
import time
import threading
from typing import Optional
from dataclasses import dataclass, field


@dataclass
class DownloadJob:
    id: str
    status: str = "pending"           # pending | processing | completed | failed
    progress: int = 0
    stage: str = "Initializing..."
    file_path: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None
    created_at: float = field(default_factory=time.time)


class DownloadJobStore:
    """Thread-safe in-memory job store with periodic cleanup."""

    TTL = 30 * 60  # 30 minutes

    def __init__(self) -> None:
        self._jobs: dict[str, DownloadJob] = {}
        self._lock = threading.Lock()

        # Background cleanup every 5 minutes
        self._timer = threading.Timer(5 * 60, self._cleanup_loop)
        self._timer.daemon = True
        self._timer.start()

    # ──────────────────────────────────────────────────────

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        with self._lock:
            self._jobs[job_id] = DownloadJob(id=job_id)
        return job_id

    def update_job(self, job_id: str, **updates: object) -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                for key, value in updates.items():
                    if hasattr(job, key):
                        setattr(job, key, value)

    def get_job(self, job_id: str) -> Optional[DownloadJob]:
        with self._lock:
            return self._jobs.get(job_id)

    # ──────────────────────────────────────────────────────

    def _cleanup_loop(self) -> None:
        self._cleanup()
        self._timer = threading.Timer(5 * 60, self._cleanup_loop)
        self._timer.daemon = True
        self._timer.start()

    def _cleanup(self) -> None:
        now = time.time()
        with self._lock:
            stale = [jid for jid, j in self._jobs.items() if now - j.created_at > self.TTL]
            for jid in stale:
                del self._jobs[jid]


# Singleton
job_store = DownloadJobStore()
