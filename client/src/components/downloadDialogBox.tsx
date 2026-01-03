import { Dialog, DialogContent, CircularProgress, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography } from "@mui/material";
import { Download, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface VideoDownloadDialogProps {
  open: boolean;
  filteredFormats: string[];
  filteredQualities: string[];
  filteredBitrates: string[];
  selectedFormat: string;
  selectedQuality: string;
  selectedBitrate: string;
  selectedFormatId: string | null;
  loadingExts: boolean;
  downloading: boolean;
  downloadError: string | null;
  onClose: () => void;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: string) => void;
  onBitrateChange: (bitrate: string) => void;
  onDownload: () => void;
}

export default function VideoDownloadDialog({
  open,
  filteredFormats,
  filteredQualities,
  filteredBitrates,
  selectedFormat,
  selectedQuality,
  selectedBitrate,
  selectedFormatId,
  loadingExts,
  downloading,
  downloadError,
  onClose,
  onFormatChange,
  onQualityChange,
  onBitrateChange,
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
        ) : filteredFormats.length === 0 && filteredQualities.length === 0 && filteredBitrates.length === 0 ? (
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
          <div className="space-y-6">
            <Typography variant="body2" className="text-gray-400 text-sm mb-4">
              Select your preferred format, quality, and bitrate. Options will automatically filter based on your selections.
            </Typography>
            
            {/* Format Selection */}
            <FormControl fullWidth className="bg-white/5 rounded-xl">
              <InputLabel 
                id="format-select-label" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': { color: '#dc2626' }
                }}
              >
                Format
              </InputLabel>
              <Select
                labelId="format-select-label"
                value={selectedFormat || ''}
                onChange={(e) => onFormatChange(e.target.value)}
                label="Format"
                disabled={downloading}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dc2626',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                {filteredFormats.map((format) => (
                  <MenuItem key={format} value={format}>
                    <Box className="flex items-center gap-3 w-full">
                      <span className="text-white font-semibold uppercase">{format}</span>
                      {format === "mp4" && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          <span className="text-xs font-semibold text-green-400">Recommended</span>
                        </div>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quality Selection */}
            <FormControl fullWidth className="bg-white/5 rounded-xl">
              <InputLabel 
                id="quality-select-label"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': { color: '#dc2626' }
                }}
              >
                Quality
              </InputLabel>
              <Select
                labelId="quality-select-label"
                value={selectedQuality || ''}
                onChange={(e) => onQualityChange(e.target.value)}
                label="Quality"
                disabled={downloading || filteredQualities.length === 0}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dc2626',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                {filteredQualities.map((quality) => (
                  <MenuItem key={quality} value={quality}>
                    <span className="text-white font-semibold">{quality}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Bitrate Selection */}
            <FormControl fullWidth className="bg-white/5 rounded-xl">
              <InputLabel 
                id="bitrate-select-label"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': { color: '#dc2626' }
                }}
              >
                Bitrate
              </InputLabel>
              <Select
                labelId="bitrate-select-label"
                value={selectedBitrate || ''}
                onChange={(e) => onBitrateChange(e.target.value)}
                label="Bitrate"
                disabled={downloading || filteredBitrates.length === 0}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dc2626',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                }}
              >
                {filteredBitrates.map((bitrate) => (
                  <MenuItem key={bitrate} value={bitrate}>
                    <span className="text-white font-semibold">{bitrate}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selection Summary */}
            {(selectedFormat || selectedQuality || selectedBitrate) && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <Typography variant="body2" className="text-red-400 font-semibold mb-2">
                  Selected Configuration:
                </Typography>
                <div className="flex flex-wrap gap-2 text-sm text-gray-300">
                  {selectedFormat && (
                    <span className="px-3 py-1 bg-white/5 rounded-lg">Format: {selectedFormat.toUpperCase()}</span>
                  )}
                  {selectedQuality && (
                    <span className="px-3 py-1 bg-white/5 rounded-lg">Quality: {selectedQuality}</span>
                  )}
                  {selectedBitrate && (
                    <span className="px-3 py-1 bg-white/5 rounded-lg">Bitrate: {selectedBitrate}</span>
                  )}
                </div>
              </div>
            )}
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
            disabled={downloading || loadingExts || !selectedFormatId}
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
                <span>Download {selectedFormat ? selectedFormat.toUpperCase() : 'Video'}</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}