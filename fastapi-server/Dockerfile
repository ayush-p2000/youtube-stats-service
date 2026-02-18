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

# Install runtime dependencies:
#   ffmpeg  — required by yt-dlp for video/audio merging
#   nodejs  — required by yt-dlp as a JavaScript runtime to bypass YouTube bot detection
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY --chown=appuser:appuser . .

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1

# Create download directory
RUN mkdir -p /app/download && chown appuser:appuser /app/download

# Switch to non-root user
USER appuser

# Expose default port (Railway will override $PORT at runtime)
EXPOSE 8080

# Health check (works with Railway's dynamic $PORT)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request, os; urllib.request.urlopen('http://localhost:' + os.environ.get('PORT', '8080') + '/api/health')" || exit 1

# Run application with Railway's $PORT (defaults to 8080 if not set)
CMD ["sh", "-c", "python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
