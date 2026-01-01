import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// Define a type for the slice state
// This is a placeholder structure based on the user's goal
interface VideoStats {
    viewCount: string;
    likeCount: string;
    commentCount: string;
}

interface VideoState {
    url: string;
    stats: VideoStats | null;
    loading: boolean;
    error: string | null;
}

const initialState: VideoState = {
    url: '',
    stats: null,
    loading: false,
    error: null,
}

export const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setVideoUrl: (state, action: PayloadAction<string>) => {
            state.url = action.payload
        },
        setVideoStats: (state, action: PayloadAction<VideoStats>) => {
            state.stats = action.payload
            state.loading = false
            state.error = null
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.loading = false
        },
    },
})

export const { setVideoUrl, setVideoStats, setLoading, setError } = videoSlice.actions

export default videoSlice.reducer
