import sys
import json
import re
from textblob import TextBlob
from collections import Counter

# Basic stop words to filter out from keywords
STOP_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 
    'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 
    'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'video', 
    'youtube', 'like', 'comment', 'subscribe', 'channel', 'best', 'good', 'really', 'wow'
}

# Emotion keyword patterns
EMOTION_KEYWORDS = {
    'joy': ['happy', 'love', 'amazing', 'awesome', 'great', 'wonderful', 'fantastic', 'excellent', 
            'beautiful', 'brilliant', 'perfect', 'thank', 'thanks', 'helpful', 'loved'],
    'anger': ['hate', 'angry', 'terrible', 'horrible', 'worst', 'stupid', 'idiot', 'trash', 
              'garbage', 'awful', 'disgusting', 'pathetic', 'useless', 'waste'],
    'sadness': ['sad', 'disappointed', 'depressing', 'sorry', 'unfortunately', 'miss', 'crying', 
                'heartbreaking', 'tragic', 'upset', 'unhappy', 'miserable'],
    'surprise': ['wow', 'omg', 'shocked', 'unbelievable', 'incredible', 'unexpected', 'amazed', 
                 'astonished', 'speechless', 'mindblowing', 'insane', 'crazy'],
    'fear': ['scared', 'afraid', 'worried', 'nervous', 'terrified', 'anxious', 'creepy', 
             'frightening', 'scary', 'horror', 'panic', 'dread'],
    'excitement': ['excited', 'cant wait', 'pumped', 'hyped', 'thrilled', 'eager', 'stoked', 
                   'fired up', 'looking forward', 'finally', 'yes', 'yay', 'woohoo']
}

# Spam detection patterns
SPAM_PATTERNS = [
    r'check\s*(out)?\s*my\s*(channel|video|page)',
    r'sub\s*(scribe)?\s*(to)?\s*me',
    r'follow\s*me',
    r'(http|https|www\.)',
    r'free\s*(gift|money|coins|v-?bucks)',
    r'giveaway',
    r'(\d+)\s*(subscribers|subs|followers)',
    r'first(!|\.)*$',
    r'^(first|1st)$',
    r'who.*(watching|here).*(20\d\d|\d{4})',
    r'like\s*if\s*you',
    r'nobody:',
]

def detect_emotions(comment_lower):
    """Detect emotions in a comment based on keyword matching."""
    emotions = {emotion: 0 for emotion in EMOTION_KEYWORDS}
    
    for emotion, keywords in EMOTION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in comment_lower:
                emotions[emotion] += 1
                break  # Count each emotion only once per comment
    
    return emotions

def detect_spam(comment, comment_lower):
    """Detect if a comment is likely spam/bot."""
    # Check for spam patterns
    for pattern in SPAM_PATTERNS:
        if re.search(pattern, comment_lower, re.IGNORECASE):
            return True
    
    # Check for excessive caps (more than 70% uppercase and length > 10)
    if len(comment) > 10:
        upper_count = sum(1 for c in comment if c.isupper())
        if upper_count / len(comment) > 0.7:
            return True
    
    # Check for repetitive characters (e.g., "aaaaaa" or "!!!!!!!")
    if re.search(r'(.)\1{5,}', comment):
        return True
    
    return False

def detect_sarcasm(comment_lower, polarity, subjectivity):
    """
    Simple sarcasm detection based on mixed signals.
    High subjectivity + contradicting polarity indicators.
    """
    positive_words = ['great', 'amazing', 'wonderful', 'love', 'best', 'perfect', 'awesome']
    negative_indicators = ['not', 'but', 'however', 'yet', 'though', '...', 'sure', 'right', 'yeah right']
    
    has_positive = any(word in comment_lower for word in positive_words)
    has_negative_indicator = any(indicator in comment_lower for indicator in negative_indicators)
    
    # If has positive words but also negative indicators and is highly subjective
    if has_positive and has_negative_indicator and subjectivity > 0.5:
        return True
    
    # If polarity is very positive but ends with sarcastic patterns
    if polarity > 0.3 and re.search(r'\.\.\.|lol|lmao|sure|right$', comment_lower):
        return True
    
    return False

def analyze_sentiment_and_topics(comments):
    results = {
        "positive": 0,
        "negative": 0,
        "neutral": 0,
        "average_polarity": 0,
        "total": len(comments),
        "topics": [],
        # New advanced fields
        "emotions": {
            "joy": 0,
            "anger": 0,
            "sadness": 0,
            "surprise": 0,
            "fear": 0,
            "excitement": 0
        },
        "spam_count": 0,
        "spam_comments": [],
        "sarcasm_detected": 0
    }

    if not comments:
        return results

    total_polarity = 0
    words = []
    
    for comment in comments:
        comment_lower = comment.lower()
        
        # Sentiment Analysis
        analysis = TextBlob(comment)
        polarity = analysis.sentiment.polarity
        subjectivity = analysis.sentiment.subjectivity
        total_polarity += polarity

        if polarity > 0.05:
            results["positive"] += 1
        elif polarity < -0.05:
            results["negative"] += 1
        else:
            results["neutral"] += 1
        
        # Emotion Detection
        emotions = detect_emotions(comment_lower)
        for emotion, count in emotions.items():
            results["emotions"][emotion] += count
        
        # Spam Detection
        if detect_spam(comment, comment_lower):
            results["spam_count"] += 1
            if len(results["spam_comments"]) < 5:  # Keep only first 5 examples
                results["spam_comments"].append(comment[:100])  # Truncate long comments
        
        # Sarcasm Detection
        if detect_sarcasm(comment_lower, polarity, subjectivity):
            results["sarcasm_detected"] += 1
        
        # Tokenize for topics
        clean_text = re.sub(r'[^a-zA-Z\s]', '', comment_lower)
        words.extend([w for w in clean_text.split() if w not in STOP_WORDS and len(w) > 3])

    results["average_polarity"] = total_polarity / len(comments)
    
    # Keyword Extraction
    counts = Counter(words)
    results["topics"] = [{"name": name, "count": count} for name, count in counts.most_common(10)]
    
    return results

if __name__ == "__main__":
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input data"}))
            sys.exit(1)
            
        comments = json.loads(input_data)
        analysis_results = analyze_sentiment_and_topics(comments)
        print(json.dumps(analysis_results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
