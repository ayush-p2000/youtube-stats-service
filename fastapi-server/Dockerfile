# Use a slim Python image
FROM python:3.11-slim

# Install system dependencies (ffmpeg is required for yt-dlp to merge high-res videos)
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables for production
ENV PORT=5001
ENV PYTHONUNBUFFERED=1

# Expose the port
EXPOSE 5001

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5001"]
