export const MOCK_VIDEO_STATS = {
    snippet: {
        title: "Global Korea Scholarship (GKS) Forms | How to fill the Application | Personal Statement - Study Plan",
        description: "Full guide on filling the GKS application forms.",
        thumbnails: {
            high: { url: "https://i.ytimg.com/vi/7nSyWvjyaHM/hqdefault.jpg" }
        },
        publishedAt: "2025-01-01T00:00:00Z"
    },
    statistics: {
        viewCount: "5388",
        likeCount: "203",
        commentCount: "1000",
    }
};

const sentiments = [
    { text: "This is so helpful and amazing, thank you!", author: "User1", sentiment: "positive" }, // joy
    { text: "Great video, I love it!", author: "User2", sentiment: "positive" }, // joy
    { text: "I am so happy and excited with this guide.", author: "User3", sentiment: "positive" }, // joy, excitement
    { text: "Best explanation ever, wonderful surprise!", author: "User4", sentiment: "positive" }, // joy, surprise
    { text: "I am confused and a bit sad about form 5. Can you explain more?", author: "User5", sentiment: "neutral" }, // sadness
    { text: "Subtitles are a bit off, I'm worried.", author: "User6", sentiment: "neutral" }, // fear
    { text: "Incomplete information regarding the documents. This is the worst and makes me angry!", author: "User7", sentiment: "negative" }, // anger
    { text: "Too long, I got bored and angry, but also surprised.", author: "User8", sentiment: "negative" }, // anger, surprise
    { text: "Is this for 2026 as well? I'm nervous but excited!", author: "User9", sentiment: "neutral" }, // fear, excitement
    { text: "Waste of time, I hate this. So disappointing and sad.", author: "User10", sentiment: "negative" }, // anger, sadness
    { text: "Wow, I got the scholarship thanks to you! So happy and surprised!", author: "User11", sentiment: "positive" }, // joy, surprise
    { text: "Check my channel for more tips!", author: "User12", sentiment: "neutral" }, // spam-ish
];

export const generateMockComments = (count: number) => {
    const comments = [];
    for (let i = 0; i < count; i++) {
        const template = sentiments[i % sentiments.length]!;
        comments.push({
            id: `mock-id-${i}`,
            snippet: {
                topLevelComment: {
                    snippet: {
                        textDisplay: `${template.text} [#${i}]`,
                        authorDisplayName: `${template.author}${i}`,
                        likeCount: Math.floor(Math.random() * 50),
                        publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
                    }
                }
            }
        });
    }
    return comments;
};

export const MOCK_COMMENTS_RESPONSE = {
    items: generateMockComments(1000),
    nextPageToken: null
};
