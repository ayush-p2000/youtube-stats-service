import { Dialog, DialogContent, RadioGroup, FormControlLabel, Radio, CircularProgress, Button } from "@mui/material";
import { Download, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          background: 'linear-gradient(145deg, rgba(15, 15, 15, 0.98) 0%, rgba(24, 24, 24, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(220, 38, 38, 0.15)',
          overflow: 'hidden',
        }
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-gradient-to-br from-red-500/5 via-transparent to-purple-500/5 animate-pulse" style={{ animationDuration: '3s' }} />

      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

      <DialogContent className="relative z-10 p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-xl" />
            <div className="relative bg-linear-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl">
              <Download className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              Download Video
              <Sparkles className="w-5 h-5 text-red-400 animate-pulse" />
            </h2>
            <p className="text-sm text-gray-400">Select your preferred format</p>
          </div>
        </div>

        {/* Content */}
        {loadingExts ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse" />
              <CircularProgress
                size={48}
                thickness={4}
                sx={{
                  color: '#dc2626',
                  '& circle': { strokeLinecap: 'round' }
                }}
              />
            </div>
            <p className="text-gray-300 font-medium">Scanning formats...</p>
            <p className="text-sm text-gray-500">Please wait</p>
          </div>
        ) : exts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-gray-300 font-medium mb-2">No formats available</p>
            <p className="text-sm text-gray-500">
              This video does not have downloadable formats at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <RadioGroup
              value={selectedExt}
              onChange={(e) => onExtChange((e.target as HTMLInputElement).value)}
            >
              {exts.map((ext) => (
                <label
                  key={ext}
                  className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 group ${selectedExt === ext
                    ? 'bg-linear-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/50'
                    : 'bg-white/5 border-2 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                  {selectedExt === ext && (
                    <div className="absolute inset-0 bg-linear-gradient-to-r from-red-500/10 to-transparent rounded-xl animate-pulse" />
                  )}

                  <FormControlLabel
                    value={ext}
                    control={
                      <Radio
                        sx={{
                          color: 'rgba(255, 255, 255, 0.3)',
                          '&.Mui-checked': {
                            color: '#dc2626',
                          },
                        }}
                      />
                    }
                    label=""
                    className="m-0"
                  />

                  <div className="flex items-center justify-between flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white uppercase tracking-wider">
                        {ext}
                      </span>
                      {ext === "mp4" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-xs font-semibold text-green-400">Recommended</span>
                        </div>
                      )}
                    </div>

                    {selectedExt === ext && (
                      <div className="flex items-center gap-2 text-red-400">
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Error Message */}
        {downloadError && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Download Failed</p>
                <p className="text-xs text-red-300/80">{downloadError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={onClose}
            disabled={downloading}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={onDownload}
            disabled={downloading || loadingExts || exts.length === 0}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'white',
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
                boxShadow: '0 6px 30px rgba(220, 38, 38, 0.6)',
                '&::before': {
                  left: '100%',
                }
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
                boxShadow: 'none',
              }
            }}
          >
            {downloading ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={20} sx={{ color: 'white' }} />
                <span>Downloading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Download {selectedExt.toUpperCase()}</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}