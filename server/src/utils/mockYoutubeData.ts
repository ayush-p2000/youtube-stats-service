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

export const MOCK_EARNINGS_DATA = {
    estimated_cpm: 4.52,
    estimated_rpm: 3.15,
    total_earnings: 1245.67,
    forecast: {
        daily: 12.45,
        weekly: 87.15,
        monthly: 373.50
    },
    history: [
        { date: "2023-12-01", earnings: 10.5, views: 3500 },
        { date: "2023-12-02", earnings: 12.2, views: 4100 },
        { date: "2023-12-03", earnings: 9.8, views: 3200 },
        { date: "2023-12-04", earnings: 11.5, views: 3800 },
        { date: "2023-12-05", earnings: 14.2, views: 4700 },
        { date: "2023-12-06", earnings: 13.1, views: 4300 },
        { date: "2023-12-07", earnings: 12.5, views: 4150 },
        { date: "2023-12-08", earnings: 15.6, views: 5200 },
        { date: "2023-12-09", earnings: 18.2, views: 6000 },
        { date: "2023-12-10", earnings: 16.5, views: 5500 },
        { date: "2023-12-11", earnings: 14.8, views: 4900 },
        { date: "2023-12-12", earnings: 13.2, views: 4400 },
        { date: "2023-12-13", earnings: 12.1, views: 4000 },
        { date: "2023-12-14", earnings: 11.4, views: 3800 },
        { date: "2023-12-15", earnings: 10.9, views: 3600 },
        { date: "2023-12-16", earnings: 13.5, views: 4500 },
        { date: "2023-12-17", earnings: 15.2, views: 5100 },
        { date: "2023-12-18", earnings: 17.8, views: 5900 },
        { date: "2023-12-19", earnings: 19.5, views: 6500 },
        { date: "2023-12-20", earnings: 21.2, views: 7000 },
        { date: "2023-12-21", earnings: 20.5, views: 6800 },
        { date: "2023-12-22", earnings: 18.9, views: 6300 },
        { date: "2023-12-23", earnings: 17.4, views: 5800 },
        { date: "2023-12-24", earnings: 15.8, views: 5200 },
        { date: "2023-12-25", earnings: 14.5, views: 4800 },
        { date: "2023-12-26", earnings: 16.7, views: 5600 },
        { date: "2023-12-27", earnings: 18.9, views: 6300 },
        { date: "2023-12-28", earnings: 20.2, views: 6700 },
        { date: "2023-12-29", earnings: 22.5, views: 7500 },
        { date: "2023-12-30", earnings: 25.1, views: 8200 }
    ],
    currency: "USD",
    confidence_score: 92
};
