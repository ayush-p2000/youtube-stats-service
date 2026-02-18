"""
Mock data for testing without a YouTube API key.
Ported from server/src/utils/mockYoutubeData.ts
"""

import random
from datetime import datetime, timedelta

SENTIMENTS = [
    {"text": "This is so helpful and amazing, thank you!", "sentiment": "positive"},
    {"text": "Great video, I love it!", "sentiment": "positive"},
    {"text": "I am so happy and excited with this guide.", "sentiment": "positive"},
    {"text": "Best explanation ever, wonderful surprise!", "sentiment": "positive"},
    {"text": "I am confused and a bit sad about form 5. Can you explain more?", "sentiment": "neutral"},
    {"text": "Subtitles are a bit off, I'm worried.", "sentiment": "neutral"},
    {"text": "Incomplete information regarding the documents. This is the worst and makes me angry!", "sentiment": "negative"},
    {"text": "Too long, I got bored and angry, but also surprised.", "sentiment": "negative"},
    {"text": "Is this for 2026 as well? I'm nervous but excited!", "sentiment": "neutral"},
    {"text": "Waste of time, I hate this. So disappointing and sad.", "sentiment": "negative"},
    {"text": "Wow, I got the scholarship thanks to you! So happy and surprised!", "sentiment": "positive"},
    {"text": "Check my channel for more tips!", "sentiment": "neutral"},
]


def generate_mock_comments(count: int = 1000) -> list[str]:
    """Generate a list of mock comment text strings for testing."""
    comments: list[str] = []
    for i in range(count):
        template = SENTIMENTS[i % len(SENTIMENTS)]
        comments.append(f"{template['text']} [#{i}]")
    return comments
