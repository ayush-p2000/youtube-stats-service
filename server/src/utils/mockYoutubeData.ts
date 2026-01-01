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
    { text: "This is so helpful, thank you!", author: "User1", sentiment: "positive" },
    { text: "Great video!", author: "User2", sentiment: "positive" },
    { text: "I love the scholarship guide, very clear.", author: "User3", sentiment: "positive" },
    { text: "Best explanation ever.", author: "User4", sentiment: "positive" },
    { text: "I am confused about form 5. Can you explain more?", author: "User5", sentiment: "neutral" },
    { text: "Subtitles are a bit off.", author: "User6", sentiment: "neutral" },
    { text: "Incomplete information regarding the documents.", author: "User7", sentiment: "negative" },
    { text: "Too long, I got bored.", author: "User8", sentiment: "negative" },
    { text: "Is this for 2026 as well?", author: "User9", sentiment: "neutral" },
    { text: "Waste of time.", author: "User10", sentiment: "negative" },
    { text: "Wow, I got the scholarship thanks to you!", author: "User11", sentiment: "positive" },
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
