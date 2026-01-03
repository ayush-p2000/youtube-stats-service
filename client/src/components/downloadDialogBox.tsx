import { Dialog, DialogContent, CircularProgress, Button, Select, MenuItem, Box, IconButton } from "@mui/material";
import { Download, AlertCircle, X, Settings2, FileVideo, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { useRef } from "react";

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
  progress: number;
  progressStage: string;
  onClose: () => void;
  onFormatChange: (format: string) => void;
  onQualityChange: (quality: string) => void;
  onBitrateChange: (bitrate: string) => void;
  onDownload: () => void;
}

const MagnetButton = ({ children, onClick, disabled, className, variant = "primary" }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "primary" | "ghost";
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const tx = useSpring(mouseX, springConfig);
  const ty = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x * 0.35);
    mouseY.set(y * 0.35);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      style={{ x: tx, y: ty }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="flex-1"
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={className}
        sx={{
          width: '100%',
          height: '56px',
          borderRadius: '20px',
          textTransform: 'none',
          fontSize: '15px',
          fontWeight: 800,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          ...(variant === "primary" ? {
            color: 'white',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            boxShadow: '0 8px 16px -4px rgba(220, 38, 38, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              boxShadow: '0 12px 24px -4px rgba(220, 38, 38, 0.6)',
            }
          } : {
            color: 'inherit',
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
          }),
          '&:disabled': { opacity: 0.5, scale: 0.98 }
        }}
      >
        {children}
        {/* Shimmer Effect */}
        {!disabled && variant === "primary" && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 1 }}
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
          />
        )}
      </Button>
    </motion.div>
  );
};

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
  progress,
  progressStage,
  onClose,
  onFormatChange,
  onQualityChange,
  onBitrateChange,
  onDownload,
}: VideoDownloadDialogProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog
      open={open}
      onClose={!downloading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(12px)',
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
          }
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '40px',
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className={`relative rounded-[40px] overflow-hidden border ${isDark ? 'border-white/10' : 'border-black/5'} shadow-2xl`}
            style={{
              background: isDark ? 'rgba(15, 15, 15, 0.85)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(40px) saturate(180%)',
            }}
          >
            {/* SVG Filters for Noise */}
            <svg className="absolute inset-0 w-0 h-0 invisible">
              <filter id="noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
                <feColorMatrix type="saturate" values="0" />
              </filter>
            </svg>

            {/* Grain/Noise Layer */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ filter: 'url(#noise)' }} />

            {/* Mesh Gradient Blobs */}
            <motion.div
              animate={{
                x: [0, 40, -40, 0],
                y: [0, -30, 30, 0],
                rotate: [0, 90, 180, 270, 360]
              }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className={`absolute -top-1/2 -left-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none`}
              style={{
                background: `radial-gradient(circle at 50% 50%, ${isDark ? '#dc2626' : '#ef4444'} 0%, transparent 40%),
                            radial-gradient(circle at 20% 80%, ${isDark ? '#7c3aed' : '#8b5cf6'} 0%, transparent 40%),
                            radial-gradient(circle at 80% 20%, #f59e0b 0%, transparent 35%)`
              }}
            />

            {/* Border Beam Effect */}
            <motion.div
              animate={{
                rotate: [0, 360]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -inset-[200%] pointer-events-none"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, #dc2626 180deg, transparent 360deg)',
                opacity: 0.1,
              }}
            />

            <DialogContent className="p-0 overflow-hidden relative z-10">
              {/* Header */}
              <div className={`relative p-8 flex items-center justify-between border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-red-600/30 blur-2xl rounded-2xl animate-pulse" />
                    <div className="relative bg-linear-to-br from-red-600 to-red-900 p-4 rounded-2xl shadow-xl border border-white/20">
                      <Download className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className={`text-2xl font-black bg-linear-to-r ${isDark ? 'from-white via-white to-gray-500' : 'from-gray-900 via-gray-800 to-gray-500'} bg-clip-text text-transparent tracking-tighter`}>
                      CORE DOWNLOAD
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                      <span className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-[0.3em]`}>Interface Synchronized</span>
                    </div>
                  </div>
                </div>
                {!downloading && (
                  <IconButton
                    onClick={onClose}
                    sx={{
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <X size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                  </IconButton>
                )}
              </div>

              {loadingExts ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="relative">
                    <CircularProgress
                      size={64}
                      thickness={2}
                      sx={{ color: '#dc2626', position: 'relative', zIndex: 1 }}
                    />
                    <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full scale-150 animate-pulse" />
                  </div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                    className="text-gray-400 font-mono text-sm mt-8 tracking-widest uppercase"
                  >
                    Parsing Media Streams...
                  </motion.p>
                </div>
              ) : filteredFormats.length === 0 && filteredQualities.length === 0 && filteredBitrates.length === 0 ? (
                <div className="py-20 px-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/5 rounded-3xl mb-6 border border-red-500/10">
                    <AlertCircle className="w-10 h-10 text-red-500/50" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Interface Offline</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                    Fatal error: Could not establish a secure handshake with the media server.
                  </p>
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  {/* Selector Group */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Format Selector */}
                    <motion.div
                      layout
                      className="space-y-3"
                    >
                      <div className="flex items-center gap-2 px-1">
                        <FileVideo size={14} className="text-red-500" />
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Format Protocol</label>
                      </div>
                      <Select
                        value={selectedFormat || ''}
                        onChange={(e) => onFormatChange(e.target.value)}
                        disabled={downloading}
                        fullWidth
                        IconComponent={() => <ChevronDown size={18} className={`mr-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
                        MenuProps={{
                          PaperProps: {
                            sx: {
                              bgcolor: isDark ? '#0f0f0f' : '#ffffff',
                              borderRadius: '24px',
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                              mt: 1,
                              '& .MuiMenuItem-root': {
                                py: 2, px: 3, mx: 1, my: 0.5, borderRadius: '16px',
                                transition: 'all 0.2s ease',
                                color: isDark ? 'white' : 'black',
                                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                                '&.Mui-selected': {
                                  bgcolor: isDark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.08)',
                                  color: '#dc2626',
                                  fontWeight: 700,
                                  '&:hover': { bgcolor: isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.12)' }
                                }
                              }
                            }
                          }
                        }}
                        sx={{
                          color: isDark ? 'white' : 'black',
                          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                          borderRadius: '20px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#dc2626',
                            borderWidth: '2px'
                          },
                          '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', height: '68px' },
                          height: '68px',
                          fontWeight: 600,
                        }}
                      >
                        {filteredFormats.map((f) => (
                          <MenuItem key={f} value={f}>
                            <Box className="flex items-center justify-between w-full">
                              <span className="font-mono tracking-tight">{f.toUpperCase()}</span>
                              {f === "mp4" && (
                                <span className={`text-[10px] px-2 py-1 ${isDark ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-green-100 text-green-700 border-green-200'} rounded-md border font-bold`}>OPTIMIZED</span>
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </motion.div>

                    {/* Quality/Bitrate Multi-row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Settings2 size={14} className="text-red-500" />
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Resolution</label>
                        </div>
                        <Select
                          value={selectedQuality || ''}
                          onChange={(e) => onQualityChange(e.target.value)}
                          disabled={downloading || filteredQualities.length === 0}
                          fullWidth
                          IconComponent={() => <ChevronDown size={18} className={`mr-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: isDark ? '#0f0f0f' : '#ffffff',
                                borderRadius: '24px',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                '& .MuiMenuItem-root': {
                                  py: 1.5, px: 3, mx: 1, my: 0.5, borderRadius: '12px',
                                  color: isDark ? 'white' : 'black',
                                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                                  '&.Mui-selected': { bgcolor: isDark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.08)' }
                                }
                              }
                            }
                          }}
                          sx={{
                            color: isDark ? 'white' : 'black',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '20px',
                            height: '68px',
                            fontWeight: 600,
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            },
                            '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', height: '68px' },
                          }}
                        >
                          {filteredQualities.map((q) => (
                            <MenuItem key={q} value={q}>{q}</MenuItem>
                          ))}
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <ShieldCheck size={14} className="text-red-500" />
                          <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em]">Data Rate</label>
                        </div>
                        <Select
                          value={selectedBitrate || ''}
                          onChange={(e) => onBitrateChange(e.target.value)}
                          disabled={downloading || filteredBitrates.length === 0}
                          fullWidth
                          IconComponent={() => <ChevronDown size={18} className={`mr-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                bgcolor: isDark ? '#0f0f0f' : '#ffffff',
                                borderRadius: '24px',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                '& .MuiMenuItem-root': {
                                  py: 1.5, px: 3, mx: 1, my: 0.5, borderRadius: '12px',
                                  color: isDark ? 'white' : 'black',
                                  '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' },
                                  '&.Mui-selected': { bgcolor: isDark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.08)' }
                                }
                              }
                            }
                          }}
                          sx={{
                            color: isDark ? 'white' : 'black',
                            bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            borderRadius: '20px',
                            height: '68px',
                            fontWeight: 600,
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid',
                              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                            },
                            '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center', height: '68px' },
                          }}
                        >
                          {filteredBitrates.map((b) => (
                            <MenuItem key={b} value={b}>{b}</MenuItem>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Progress Block */}
                  <AnimatePresence>
                    {downloading && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="p-6 bg-red-600/3 border border-red-600/20 rounded-3xl relative overflow-hidden"
                      >
                        {/* Scanning Effect Overlay */}
                        <motion.div
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          className="absolute inset-0 bg-linear-to-r from-transparent via-red-600/5 to-transparent skew-x-12 pointer-events-none"
                        />

                        <div className="flex justify-between items-end mb-4 relative z-10">
                          <div>
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">Process Thread</p>
                            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>{progressStage || 'Synchronizing...'}</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-red-500 tabular-nums">{Math.round(progress || 0)}%</span>
                          </div>
                        </div>

                        <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-y-0 left-0 bg-linear-to-r from-red-600 to-red-400 rounded-full"
                          >
                            <div className="absolute top-0 right-0 h-full w-8 bg-white blur-xs opacity-50" />
                          </motion.div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-4 text-center font-mono italic opacity-50 uppercase tracking-widest">Secure tunnel established. Receiving packets...</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error handling */}
                  {downloadError && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4 items-center"
                    >
                      <AlertCircle className="text-red-500 shrink-0" size={20} />
                      <p className="text-xs text-red-200 font-medium">{downloadError}</p>
                    </motion.div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex gap-4 pt-4">
                    {!downloading && (
                      <MagnetButton
                        onClick={onClose}
                        variant="ghost"
                        className={isDark ? 'text-gray-400' : 'text-gray-600'}
                      >
                        Abort Protocol
                      </MagnetButton>
                    )}
                    <MagnetButton
                      onClick={onDownload}
                      disabled={downloading || loadingExts || !selectedFormatId}
                      variant="primary"
                    >
                      <div className="flex items-center gap-3">
                        {downloading ? (
                          <CircularProgress size={18} thickness={6} sx={{ color: 'white' }} />
                        ) : (
                          <Zap size={18} className="fill-white" />
                        )}
                        <span className="tracking-tight uppercase">
                          {downloading ? 'Processing...' : 'Execute Download'}
                        </span>
                      </div>
                    </MagnetButton>
                  </div>
                </div>
              )}
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}