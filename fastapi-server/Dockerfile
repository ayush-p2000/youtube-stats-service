# Multi-stage build for optimized Python FastAPI application

# ── Builder Stage ──────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements to a virtual environment
COPY requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt


# ── Runtime Stage ──────────────────────────────────────────
FROM python:3.11-slim

# Install runtime dependencies only (ffmpeg for yt-dlp video merging)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY --chown=appuser:appuser . .

# Set environment variables
# NOTE: Do NOT set PORT here — Railway injects it dynamically at runtime.
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

# Create download directory
RUN mkdir -p /app/download && chown appuser:appuser /app/download

# Switch to non-root user
USER appuser

# Expose port (Railway overrides this with its own $PORT at runtime)
EXPOSE 8000

# Health check — uses $PORT so it works on Railway and locally
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD /opt/venv/bin/python -c "import urllib.request, os; urllib.request.urlopen('http://localhost:' + os.environ.get('PORT','8000') + '/api/health')" || exit 1

# Run application — shell form so $PORT is expanded from Railway's injected env var
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
