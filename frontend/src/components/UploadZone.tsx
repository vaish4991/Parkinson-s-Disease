import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, FileImage, CheckCircle2 } from 'lucide-react';

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  preview: string | null;
  onRemove: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tif', '.tiff'],
};

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, selectedFile, preview, onRemove }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onFileSelect(acceptedFiles[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
    noClick: !!selectedFile,
  });

  const hasError = isDragReject || fileRejections.length > 0;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          /* ── Upload area ── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative group flex flex-col items-center justify-center gap-5
                min-h-[260px] rounded-2xl border-2 border-dashed cursor-pointer
                transition-all duration-300 outline-none select-none
                ${hasError
                  ? 'border-red-500/60 bg-red-500/5'
                  : isDragActive
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[1.015] shadow-[0_0_40px_rgba(0,212,255,0.2)]'
                  : 'border-cyan-500/30 bg-white/[0.02] hover:border-cyan-400/60 hover:bg-cyan-500/5 hover:shadow-[0_0_30px_rgba(0,212,255,0.12)]'
                }
              `}
            >
              <input {...getInputProps()} />

              {/* Animated ring on drag */}
              {isDragActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                />
              )}

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-300
                  ${isDragActive
                    ? 'bg-cyan-500/20 shadow-[0_0_30px_rgba(0,212,255,0.4)] scale-110'
                    : hasError
                    ? 'bg-red-500/15'
                    : 'bg-cyan-500/10 group-hover:bg-cyan-500/15 group-hover:shadow-[0_0_20px_rgba(0,212,255,0.25)]'
                  }`}
              >
                <UploadCloud
                  size={36}
                  className={`transition-colors duration-300 ${
                    hasError ? 'text-red-400' : 'text-cyan-400'
                  }`}
                />
              </div>

              {/* Text */}
              <div className="text-center px-6">
                {isDragActive ? (
                  <p className="text-lg font-semibold text-cyan-300" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Release to upload
                  </p>
                ) : hasError ? (
                  <p className="text-base font-semibold text-red-400" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Invalid file — please try again
                  </p>
                ) : (
                  <>
                    <p className="text-base font-semibold text-white/80" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      Drop your drawing here
                    </p>
                    <p className="mt-1 text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      or{' '}
                      <span className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 cursor-pointer underline underline-offset-2">
                        browse files
                      </span>
                    </p>
                  </>
                )}
                <p className="mt-3 text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Supported: PNG, JPG, BMP, TIFF · Max 10 MB
                </p>
              </div>

              {/* Validation feedback */}
              {fileRejections.length > 0 && (
                <div className="px-6 w-full">
                  {fileRejections[0].errors.map((e) => (
                    <p key={e.code} className="text-xs text-red-400 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {e.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ── Preview ── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl border border-cyan-500/30 bg-white/[0.02] overflow-hidden"
          >
            {/* Image */}
            {preview && (
              <div className="relative w-full" style={{ paddingTop: '56%' }}>
                <img
                  src={preview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-contain bg-black/40"
                />
              </div>
            )}

            {/* File info bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/5 bg-black/30">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-500/10 shrink-0">
                <FileImage size={18} className="text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-white/90 truncate"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {selectedFile.name}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {formatBytes(selectedFile.size)} · {selectedFile.type || 'Unknown type'}
                </p>
              </div>
              <CheckCircle2 size={18} className="text-cyan-400 shrink-0" />
            </div>

            {/* Remove button */}
            <button
              onClick={onRemove}
              className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all duration-200"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadZone;
