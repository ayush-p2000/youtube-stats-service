import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

// Define a type for the slice state
interface VideoStats {
    title: string;
    viewCount: string;
    likeCount: string;
    commentCount: string;
}

interface Comment {
    id: string;
    text: string;
    author: string;
    likeCount: number;
    publishedAt: string;
}

interface VideoState {
    url: string;
    videoId: string | null;
    stats: VideoStats | null;
    comments: Comment[];
    nextPageToken: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: VideoState = {
    url: '',
    videoId: null,
    stats: null,
    comments: [],
    nextPageToken: null,
    loading: false,
    error: null,
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
    async ({ videoId, pageToken }: { videoId: string; pageToken?: string }, { rejectWithValue }) => {
        try {
            const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
            const url = pageToken
                ? `${serverUrl}/api/stats/${videoId}?pageToken=${pageToken}`
                : `${serverUrl}/api/stats/${videoId}`;

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch video statistics');
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

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setVideoUrl: (state, action: PayloadAction<string>) => {
            state.url = action.payload
        },
        resetVideoState: (state) => {
            state.videoId = null;
            state.stats = null;
            state.comments = [];
            state.nextPageToken = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // parseVideoUrl cases
            .addCase(parseVideoUrl.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.videoId = null;
                state.stats = null;
                state.comments = [];
                state.nextPageToken = null;
            })
            .addCase(parseVideoUrl.fulfilled, (state, action) => {
                state.loading = false;
                state.videoId = action.payload;
            })
            .addCase(parseVideoUrl.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // fetchVideoStats cases
            .addCase(fetchVideoStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVideoStats.fulfilled, (state, action) => {
                state.loading = false;

                // Only update stats if they were returned (first page)
                if (action.payload.stats) {
                    state.stats = action.payload.stats;
                }

                if (action.payload.isAppend) {
                    state.comments = [...state.comments, ...action.payload.comments];
                } else {
                    state.comments = action.payload.comments;
                }

                state.nextPageToken = action.payload.nextPageToken || null;
            })
            .addCase(fetchVideoStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
})

export const { setVideoUrl, resetVideoState } = videoSlice.actions

export default videoSlice.reducer
