import { Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, CircularProgress, Button, Chip } from "@mui/material";

interface VideoDownloadDialogProps {
  open: boolean;
  exts: string[];
  selectedExt: string;
  loadingExts: boolean;
  downloading: boolean;
  downloadError: string | null;
  onClose: () => void;
  onExtChange: (ext: string) => void;
  onDownload: () => void;
}

export default function VideoDownloadDialog({
  open,
  exts,
  selectedExt,
  loadingExts,
  downloading,
  downloadError,
  onClose,
  onExtChange,
  onDownload,
}: VideoDownloadDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Select format</DialogTitle>
      <DialogContent>
        {loadingExts ? (
          <div className="flex items-center gap-3 py-3">
            <CircularProgress size={20} />
            <span className="text-sm text-gray-600 dark:text-gray-300">Loading available formats...</span>
          </div>
        ) : exts.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No downloadable formats found for this video. Try again later.
          </p>
        ) : (
          <RadioGroup
            value={selectedExt}
            onChange={(e) => onExtChange((e.target as HTMLInputElement).value)}
          >
            {exts.map((ext) => (
              <FormControlLabel
                key={ext}
                value={ext}
                control={<Radio />}
                label={
                  <span className="inline-flex items-center gap-2">
                    <span>{ext.toUpperCase()}</span>
                    {ext === "mp4" && <Chip label="Recommended" size="small" color="success" />}
                  </span>
                }
              />
            ))}
          </RadioGroup>
        )}
        {downloadError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{downloadError}</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={downloading}>Cancel</Button>
        <Button
          onClick={onDownload}
          disabled={downloading || loadingExts || exts.length === 0}
          variant="contained"
          color="primary"
        >
          {downloading ? <CircularProgress size={20} /> : "Download"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}