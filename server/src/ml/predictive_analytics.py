import sys
import json
import math

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
    
    # Base engagement ratio
    engagement_ratio = ((likes * likes_weight + comments * comments_weight) / views) * 100
    
    # Sentiment booster (if available)
    sentiment_booster = 1.0
    if sentiment:
        pos = sentiment.get('positive', 0)
        neg = sentiment.get('negative', 0)
        total = sentiment.get('total', 1)
        if total > 0:
            # Positive sentiment increases virality, negative decreases it slightly
            sentiment_booster = 1.0 + (pos / total) - (neg / (total * 2))
            
    # Normalize to 0-100 scale using a log-like function to handle outliers
    # A score of 20 in raw engagement is already quite viral
    raw_score = engagement_ratio * sentiment_booster
    virality_score = min(100, (math.atan(raw_score / 10) / (math.pi / 2)) * 100)
    
    return round(virality_score, 1)

def generate_forecast(stats):
    """Generates simple growth projections."""
    views = int(stats.get('viewCount', 0))
    likes = int(stats.get('likeCount', 0))
    
    # Assume 5% weekly growth and 20% monthly growth for a typical trending video
    # In a real scenario, this would use time-series data
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
        
        virality = calculate_virality_score(stats, sentiment)
        forecast = generate_forecast(stats)
        recommendations = get_recommendations(virality, sentiment)
        
        results = {
            "virality_score": virality,
            "forecast": forecast,
            "recommendations": recommendations,
            "analysis_timestamp": data.get('timestamp')
        }
        
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
