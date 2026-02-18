"""
Earnings Prediction — ported from server/src/ml/earnings_prediction.py

Estimates CPM/RPM, total earnings, forecasts, and generates
historical earnings chart data based on engagement metrics.
"""

import random
from datetime import datetime, timedelta
from typing import Optional


def calculate_cpm_estimate(stats: dict, sentiment: Optional[dict] = None) -> float:
    """
    Estimates CPM based on engagement and sentiment.
    Base CPM ranges from $2 to $10.
    """
    views = int(stats.get('viewCount', 0))
    likes = int(stats.get('likeCount', 0))
    comments = int(stats.get('commentCount', 0))

    if views == 0:
        return 0

    # Engagement booster (higher engagement usually means more valuable audience)
    engagement_rate = (likes + comments) / views
    engagement_booster = min(2.0, 1.0 + (engagement_rate * 50))

    # Sentiment booster
    sentiment_booster = 1.0
    if sentiment:
        pos = sentiment.get('positive', 0)
        total = sentiment.get('total', 1)
        if total > 0:
            sentiment_booster = 0.8 + (pos / total) * 0.4

    base_cpm = 4.50  # Average base
    estimated_cpm = base_cpm * engagement_booster * sentiment_booster

    # Final range clamping
    return round(max(2.0, min(15.0, estimated_cpm)), 2)


def calculate_earnings_data(
    stats: dict,
    sentiment: Optional[dict] = None,
    comments: Optional[list] = None,
) -> dict:
    """
    Calculate full earnings data including CPM, RPM, forecasts, and history.
    Returns a dict matching the TS server's response shape.
    """
    if comments is None:
        comments = []

    views = int(stats.get('viewCount', 0))
    published_at = stats.get('publishedAt')

    cpm = calculate_cpm_estimate(stats, sentiment)
    rpm = round(cpm * 0.55, 2)  # Typically 55% of CPM goes to creator

    total_earnings = (views / 1000) * rpm

    # Forecasts
    views_per_day = views / 30  # Default if we can't calculate
    if published_at:
        start_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
        days_active = max(1, (datetime.now(start_date.tzinfo) - start_date).days)
        views_per_day = views / days_active

    forecast_7d = (views_per_day * 7) * (rpm / 1000)
    forecast_30d = (views_per_day * 30) * (rpm / 1000)

    daily_est_revenue = (views_per_day / 1000) * rpm

    def generate_history(days: int, points_count: int, period_type: str = "daily") -> list[dict]:
        history_data: list[dict] = []
        now = datetime.now()

        # Base value for each point depends on the period type
        if period_type == "monthly":
            base_val = daily_est_revenue * 30
        else:
            base_val = daily_est_revenue

        for i in range(points_count - 1, -1, -1):
            if days == 365:
                # Monthly points for year view
                date = (now - timedelta(days=i * 30)).strftime('%Y-%m')
            else:
                # Daily points
                date = (now - timedelta(days=i)).strftime('%m-%d')

            # Add some randomness and a slight trend
            variance = random.uniform(0.8, 1.2)

            # Slight growth trend for recent data
            progress = (points_count - i) / points_count
            trend = 0.95 + (0.1 * progress)

            val = base_val * variance * trend

            history_data.append({
                "date": date,
                "earnings": round(val, 2),
                "views": int((val / (rpm if rpm > 0 else 1)) * 1000)
            })
        return history_data

    history_7d = generate_history(7, 7, "daily")
    history_30d = generate_history(30, 30, "daily")
    history_1y = generate_history(365, 12, "monthly")

    return {
        "estimated_cpm": cpm,
        "estimated_rpm": rpm,
        "total_earnings": round(total_earnings, 2),
        "forecast": {
            "daily": round(views_per_day * (rpm / 1000), 2),
            "weekly": round(forecast_7d, 2),
            "monthly": round(forecast_30d, 2)
        },
        "history_7d": history_7d,
        "history_30d": history_30d,
        "history_1y": history_1y,
        "currency": "USD",
        "confidence_score": 85 if len(comments) > 10 else 60
    }
