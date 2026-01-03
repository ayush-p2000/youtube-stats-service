import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

// Define a type for the slice state
export interface VideoStats {
    title: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
    publishedAt: string;
}

export interface Comment {
    id: string;
    text: string;
    author: string;
    likeCount: number;
    publishedAt: string;
}

export interface SentimentData {
    positive: number;
    negative: number;
    neutral: number;
    average_polarity: number;
    total: number;
    topics: { name: string; count: number }[];
    // Advanced sentiment fields
    emotions: {
        joy: number;
        anger: number;
        sadness: number;
        surprise: number;
        fear: number;
        excitement: number;
    };
    spam_count: number;
    spam_comments: string[];
    sarcasm_detected: number;
}

interface PredictionData {
    virality_score: number;
    forecast: {
        views_7d: number;
        views_30d: number;
        likes_7d: number;
        likes_30d: number;
        growth_trend: string;
    };
    recommendations: string[];
    chart_data?: {
        date: string;
        views: number;
        regression: number;
    }[];
}

interface EarningsData {
    estimated_cpm: number;
    estimated_rpm: number;
    total_earnings: number;
    forecast: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    history_7d: {
        date: string;
        earnings: number;
        views: number;
    }[];
    history_30d: {
        date: string;
        earnings: number;
        views: number;
    }[];
    history_1y: {
        date: string;
        earnings: number;
        views: number;
    }[];
    currency: string;
    confidence_score: number;
}

interface VideoState {
    url: string;
    videoId: string | null;
    redirectId: string | null;
    stats: VideoStats | null;
    comments: Comment[];
    sentiment: SentimentData | null;
    prediction: PredictionData | null;
    earnings: EarningsData | null;
    nextPageToken: string | null;
    statsLoading: boolean;
    sentimentLoading: boolean;
    predictionLoading: boolean;
    earningsLoading: boolean;
    isNavigating: boolean;
    error: string | null;
    apiKey: string | null;
}

const initialState: VideoState = {
    url: '',
    videoId: null,
    redirectId: null,
    stats: null,
    comments: [],
    sentiment: null,
    prediction: null,
    earnings: null,
    nextPageToken: null,
    statsLoading: false,
    sentimentLoading: false,
    predictionLoading: false,
    earningsLoading: false,
    isNavigating: false,
    error: null,
    apiKey: null,
}

// Async thunk to parse the URL via backend
export const parseVideoUrl = createAsyncThunk(
    'video/parseUrl',
    async (url: string, { rejectWithValue }) => {
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
            const response = await fetch(`${serverUrl}/api/parse-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to parse URL');
            }

            return data.videoId;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to fetch video stats and comments
export const fetchVideoStats = createAsyncThunk(
    'video/fetchStats',
    async ({ videoId, pageToken, apiKey }: { videoId: string; pageToken?: string; apiKey?: string }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { video: VideoState };
            const usedApiKey = apiKey || state.video.apiKey;

            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
            let url = pageToken
                ? `${serverUrl}/api/stats/${videoId}?pageToken=${pageToken}`
                : `${serverUrl}/api/stats/${videoId}`;

            if (usedApiKey) {
                // Determine if we already have query params
                const separator = url.includes('?') ? '&' : '?';
                url += `${separator}apiKey=${encodeURIComponent(usedApiKey)}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch video statistics');
            }

            // Handle limited mode (valid video, but no API key)
            if (data.status === 'limited') {
                return {
                    stats: null,
                    comments: [],
                    isAppend: false,
                    videoId: data.data.videoId // Ensure videoId is passed
                };
            }

            return {
                ...data.data,
                isAppend: !!pageToken
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk to perform sentiment analysis
export const analyzeSentiment = createAsyncThunk(
    'video/analyzeSentiment',
    async (videoId: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { video: VideoState };
            const apiKey = state.video.apiKey;

            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
            const response = await fetch(`${serverUrl}/api/analyze-sentiment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ videoId, apiKey }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to analyze sentiment');
            }

            return data.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk for predictive analytics
export const predictMetrics = createAsyncThunk(
    'video/predictMetrics',
    async ({ videoId, stats, sentiment, comments }: { videoId: string; stats: VideoStats; sentiment?: SentimentData; comments?: Comment[] }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { video: VideoState };
            const apiKey = state.video.apiKey;

            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
            const response = await fetch(`${serverUrl}/api/predict/${videoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stats, sentiment, comments, apiKey }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to generate predictions');
            }

            return data.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            return rejectWithValue(errorMessage);
        }
    }
);

// Async thunk for earnings prediction
export const fetchEarnings = createAsyncThunk(
    'video/fetchEarnings',
    async ({ videoId, stats, sentiment, comments }: { videoId: string; stats: VideoStats; sentiment?: SentimentData; comments?: Comment[] }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { video: VideoState };
            const apiKey = state.video.apiKey;

            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
            const response = await fetch(`${serverUrl}/api/earnings/${videoId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ stats, sentiment, comments, apiKey }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch earnings prediction');
            }

            return data.data;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            return rejectWithValue(errorMessage);
        }
    }
);

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setVideoUrl: (state, action: PayloadAction<string>) => {
            state.url = action.payload
        },
        setApiKey: (state, action: PayloadAction<string | null>) => {
            state.apiKey = action.payload;
        },
        setRedirectId: (state, action: PayloadAction<string | null>) => { // Added setRedirectId reducer
            state.redirectId = action.payload;
        },
        resetVideoState: (state) => {
            state.url = '';
            state.videoId = null;
            state.redirectId = null;
            state.stats = null;
            state.comments = [];
            state.sentiment = null;
            state.prediction = null;
            state.earnings = null;
            state.nextPageToken = null;
            state.statsLoading = false;
            state.sentimentLoading = false;
            state.predictionLoading = false;
            state.earningsLoading = false;
            state.isNavigating = false;
            state.error = null;
        },
        setIsNavigating: (state, action: PayloadAction<boolean>) => {
            state.isNavigating = action.payload;
        },
        clearRedirectId: (state) => {
            state.redirectId = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // parseVideoUrl cases
            .addCase(parseVideoUrl.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
                state.videoId = null;
                state.redirectId = null;
                state.stats = null;
                state.comments = [];
                state.sentiment = null;
                state.prediction = null;
                state.earnings = null;
                state.nextPageToken = null;
            })
            .addCase(parseVideoUrl.fulfilled, (state, action) => {
                state.statsLoading = false;
                // Only update if we haven't reset the state
                state.videoId = action.payload;
                state.redirectId = action.payload;
            })
            .addCase(parseVideoUrl.rejected, (state, action) => {
                state.statsLoading = false;
                // Ignore errors if the request was aborted (user navigated away)
                if (action.meta.aborted) return;
                state.error = action.payload as string;
            })
            // fetchVideoStats cases
            .addCase(fetchVideoStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
            })
            .addCase(fetchVideoStats.fulfilled, (state, action) => {
                state.statsLoading = false;

                // Only ignore if we're already tracking a DIFFERENT video
                // (This prevents stale responses from overwriting current data)
                if (state.videoId && state.videoId !== action.meta.arg.videoId) return;

                state.videoId = action.meta.arg.videoId;

                // Only update stats if they were returned (first page)
                if (action.payload.stats) {
                    state.stats = action.payload.stats;
                } else if (action.payload.stats === null && !action.payload.isAppend) {
                    // Explicitly clear stats if limited mode and not appending
                    state.stats = null;
                }

                if (action.payload.isAppend) {
                    state.comments = [...state.comments, ...action.payload.comments];
                } else {
                    state.comments = action.payload.comments;
                }

                state.nextPageToken = action.payload.nextPageToken || null;
            })
            .addCase(fetchVideoStats.rejected, (state, action) => {
                state.statsLoading = false;
                if (action.meta.aborted) return;
                state.error = action.payload as string;
            })
            // analyzeSentiment cases
            .addCase(analyzeSentiment.pending, (state) => {
                state.sentimentLoading = true;
                state.error = null;
            })
            .addCase(analyzeSentiment.fulfilled, (state, action) => {
                state.sentimentLoading = false;
                // Ignore if we've reset the state
                if (state.videoId === null) return;
                state.sentiment = action.payload;
            })
            .addCase(analyzeSentiment.rejected, (state, action) => {
                state.sentimentLoading = false;
                if (action.meta.aborted) return;
                state.error = action.payload as string;
            })
            // predictMetrics cases
            .addCase(predictMetrics.pending, (state) => {
                state.predictionLoading = true;
                state.error = null;
            })
            .addCase(predictMetrics.fulfilled, (state, action) => {
                state.predictionLoading = false;
                if (state.videoId === null) return;
                state.prediction = action.payload;
            })
            .addCase(predictMetrics.rejected, (state, action) => {
                state.predictionLoading = false;
                if (action.meta.aborted) return;
                state.error = action.payload as string;
            })
            // fetchEarnings cases
            .addCase(fetchEarnings.pending, (state) => {
                state.earningsLoading = true;
                state.error = null;
            })
            .addCase(fetchEarnings.fulfilled, (state, action) => {
                state.earningsLoading = false;
                if (state.videoId === null) return;
                state.earnings = action.payload;
            })
            .addCase(fetchEarnings.rejected, (state, action) => {
                state.earningsLoading = false;
                if (action.meta.aborted) return;
                state.error = action.payload as string;
            });
    },
})

export const { setVideoUrl, setApiKey, setRedirectId, resetVideoState, clearRedirectId, setIsNavigating } = videoSlice.actions

export default videoSlice.reducer
