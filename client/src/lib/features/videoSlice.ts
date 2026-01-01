import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

// Define a type for the slice state
interface VideoStats {
    viewCount: string;
    likeCount: string;
    commentCount: string;
}

interface VideoState {
    url: string;
    videoId: string | null;
    stats: VideoStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: VideoState = {
    url: '',
    videoId: null,
    stats: null,
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
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(parseVideoUrl.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.videoId = null;
            })
            .addCase(parseVideoUrl.fulfilled, (state, action) => {
                state.loading = false;
                state.videoId = action.payload;
            })
            .addCase(parseVideoUrl.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
})

export const { setVideoUrl, resetVideoState } = videoSlice.actions

export default videoSlice.reducer
