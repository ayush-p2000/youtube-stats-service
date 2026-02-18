"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearError } from "@/lib/features/videoSlice";
import { Snackbar, Alert } from "@mui/material";

export default function ErrorSnackbar() {
    const dispatch = useAppDispatch();
    const error = useAppSelector((state) => state.video.error);

    const handleClose = (
        _event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") return;
        dispatch(clearError());
    };

    return (
        <Snackbar
            open={!!error}
            autoHideDuration={8000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ mt: 2 }}
        >
            <Alert
                onClose={handleClose}
                severity="error"
                variant="filled"
                sx={{
                    width: "100%",
                    maxWidth: 520,
                    borderRadius: "16px",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(12px)",
                    "& .MuiAlert-icon": { fontSize: 24 },
                }}
            >
                {error}
            </Alert>
        </Snackbar>
    );
}
