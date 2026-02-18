from pydantic import BaseModel
from typing import Optional


# ── Sentiment ──────────────────────────────────────────────

class SentimentRequest(BaseModel):
    videoId: str
    comments: list[str]


class Topic(BaseModel):
    name: str
    count: int


class EmotionBreakdown(BaseModel):
    joy: int = 0
    anger: int = 0
    sadness: int = 0
    surprise: int = 0
    fear: int = 0
    excitement: int = 0


class SentimentData(BaseModel):
    positive: int = 0
    negative: int = 0
    neutral: int = 0
    average_polarity: float = 0.0
    total: int = 0
    topics: list[Topic] = []
    emotions: EmotionBreakdown = EmotionBreakdown()
    spam_count: int = 0
    spam_comments: list[str] = []
    sarcasm_detected: int = 0


# ── Prediction ─────────────────────────────────────────────

class VideoStats(BaseModel):
    viewCount: str = "0"
    likeCount: str = "0"
    commentCount: str = "0"
    publishedAt: Optional[str] = None


class PredictionRequest(BaseModel):
    stats: VideoStats
    sentiment: Optional[dict] = None
    comments: Optional[list[dict]] = None


class Forecast(BaseModel):
    views_7d: int = 0
    views_30d: int = 0
    likes_7d: int = 0
    likes_30d: int = 0
    growth_trend: str = "Stable"


class ChartDataPoint(BaseModel):
    date: str
    views: int
    day: int
    regression: int = 0


class PredictionData(BaseModel):
    virality_score: float = 0.0
    forecast: Forecast = Forecast()
    recommendations: list[str] = []
    chart_data: list[ChartDataPoint] = []
    analysis_timestamp: Optional[str] = None


# ── Earnings ───────────────────────────────────────────────

class EarningsRequest(BaseModel):
    stats: VideoStats
    sentiment: Optional[dict] = None
    comments: Optional[list[dict]] = None


class EarningsForecast(BaseModel):
    daily: float = 0.0
    weekly: float = 0.0
    monthly: float = 0.0


class HistoryPoint(BaseModel):
    date: str
    earnings: float
    views: int


class EarningsData(BaseModel):
    estimated_cpm: float = 0.0
    estimated_rpm: float = 0.0
    total_earnings: float = 0.0
    forecast: EarningsForecast = EarningsForecast()
    history_7d: list[HistoryPoint] = []
    history_30d: list[HistoryPoint] = []
    history_1y: list[HistoryPoint] = []
    currency: str = "USD"
    confidence_score: int = 60


# ── Generic API Envelope ───────────────────────────────────

class ApiResponse(BaseModel):
    status: str
    data: Optional[dict] = None
    message: Optional[str] = None
