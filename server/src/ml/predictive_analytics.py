import sys
import json
import math
from datetime import datetime, timedelta

def calculate_linear_regression(data_points):
    """
    Calculates linear regression (y = mx + b).
    data_points: list of [x, y] where x is days from start, y is views.
    """
    n = len(data_points)
    if n < 2:
        return []

    sum_x = sum(p[0] for p in data_points)
    sum_y = sum(p[1] for p in data_points)
    sum_xx = sum(p[0] * p[0] for p in data_points)
    sum_xy = sum(p[0] * p[1] for p in data_points)

    denominator = (n * sum_xx - sum_x * sum_x)
    if denominator == 0:
        return []

    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n

    return [slope, intercept]

def estimate_historical_growth(stats, comments, published_at):
    """
    Estimates historical view growth based on comment frequency.
    This is a proxy since we don't have actual daily view stats.
    """
    total_views = int(stats.get('viewCount', 0))
    if not published_at:
        return []
    
    start_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
    now = datetime.now(start_date.tzinfo)
    total_days = (now - start_date).days
    
    if total_days <= 0:
        return []

    # Sort comments by date
    comment_dates = []
    for c in (comments or []):
        try:
            date_str = c.get('publishedAt')
            if date_str:
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                comment_dates.append((date - start_date).days)
        except:
            continue
    
    comment_dates.sort()
    
    # Create daily data points
    # If no comments, assume linear growth
    if not comment_dates:
        data_points = []
        for d in range(0, total_days + 1, max(1, total_days // 10)):
            data_points.append({
                "date": (start_date + timedelta(days=d)).strftime('%Y-%m-%d'),
                "views": int((total_views / total_days) * d),
                "day": d
            })
    else:
        # Use comment distribution combined with a linear base growth
        data_points = []
        total_comments = len(comment_dates)
        
        # We split views into:
        # 20% Organic Linear Growth (background views)
        # 80% Viral/Comment-driven Growth
        ORGANIC_WEIGHT = 0.2
        VIRAL_WEIGHT = 0.8
        
        for d in range(0, total_days + 1, max(1, total_days // 15)):
            # Organic part: simple linear progress
            organic_part = (d / total_days) * ORGANIC_WEIGHT
            
            # Viral part: based on comment density
            comments_before = len([cd for cd in comment_dates if cd <= d])
            viral_part = (comments_before / total_comments) * VIRAL_WEIGHT
            
            combined_weight = organic_part + viral_part
            
            data_points.append({
                "date": (start_date + timedelta(days=d)).strftime('%Y-%m-%d'),
                "views": int(total_views * combined_weight),
                "day": d
            })
            
    # Calculate Regression
    points = [[p['day'], p['views']] for p in data_points]
    regression = calculate_linear_regression(points)
    
    if regression:
        slope, intercept = regression
        for p in data_points:
            p['regression'] = max(0, int(slope * p['day'] + intercept))
    else:
        for p in data_points:
            p['regression'] = p['views']

    return data_points

def calculate_virality_score(stats, sentiment=None):
    """
    Calculate a virality score from 0 to 100 based on engagement metrics.
    """
    views = int(stats.get('viewCount', 0))
    likes = int(stats.get('likeCount', 0))
    comments = int(stats.get('commentCount', 0))
    
    if views == 0:
        return 0
        
    likes_weight = 2
    comments_weight = 5
    
    engagement_ratio = ((likes * likes_weight + comments * comments_weight) / views) * 100
    
    sentiment_booster = 1.0
    if sentiment:
        pos = sentiment.get('positive', 0)
        neg = sentiment.get('negative', 0)
        total = sentiment.get('total', 1)
        if total > 0:
            sentiment_booster = 1.0 + (pos / total) - (neg / (total * 2))
            
    raw_score = engagement_ratio * sentiment_booster
    virality_score = min(100, (math.atan(raw_score / 10) / (math.pi / 2)) * 100)
    
    return round(virality_score, 1)

def generate_forecast(stats):
    """Generates simple growth projections."""
    views = int(stats.get('viewCount', 0))
    likes = int(stats.get('likeCount', 0))
    
    return {
        "views_7d": int(views * 1.05),
        "views_30d": int(views * 1.25),
        "likes_7d": int(likes * 1.05),
        "likes_30d": int(likes * 1.25),
        "growth_trend": "Increasing" if views > 1000 else "Stable"
    }

def get_recommendations(virality_score, sentiment=None):
    """Generate AI recommendations based on metrics."""
    recs = []
    
    if virality_score > 70:
        recs.append("🔥 High Viral Potential: This video is blowing up! Consider a 'Part 2' immediately.")
    elif virality_score > 40:
        recs.append("📈 Strong Momentum: Engagement is high. Try to engage more in the comments to boost the algorithm.")
        
    if sentiment and sentiment.get('negative', 0) > sentiment.get('total', 1) * 0.3:
        recs.append("⚠️ Content Warning: High negative sentiment detected. Check comments for potential controversy.")
    elif sentiment and sentiment.get('joy', 0) > sentiment.get('total', 1) * 0.4:
        recs.append("🌟 Fan Favorite: The audience loves this content style. Double down on this niche.")
        
    if not recs:
        recs.append("📊 Steady Growth: Keep consistent with your upload schedule to build more momentum.")
        
    return recs

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data"}))
            sys.exit(1)
            
        data = json.loads(input_data)
        stats = data.get('stats', {})
        sentiment = data.get('sentiment', None)
        comments = data.get('comments', [])
        published_at = stats.get('publishedAt')
        
        virality = calculate_virality_score(stats, sentiment)
        forecast = generate_forecast(stats)
        recommendations = get_recommendations(virality, sentiment)
        
        chart_data = estimate_historical_growth(stats, comments, published_at)
        
        results = {
            "virality_score": virality,
            "forecast": forecast,
            "recommendations": recommendations,
            "chart_data": chart_data,
            "analysis_timestamp": data.get('timestamp')
        }
        
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

