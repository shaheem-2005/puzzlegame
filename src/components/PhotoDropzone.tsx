import React, { useRef, useState } from 'react';
import { Upload, CheckCircle2, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ADVENTURES } from '../data/adventures';
import { sound } from '../utils/audio';

interface PhotoDropzoneProps {
  customPhotos: Record<string, string>;
  onPhotoUploaded: (adventureId: string, dataUrl: string, fileName?: string) => void;
  onClearCustomPhoto: (adventureId: string) => void;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({
  customPhotos,
  onPhotoUploaded,
  onClearCustomPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Match file to adventure by name
  const matchFileToAdventure = (fileName: string): string | null => {
    const lower = fileName.toLowerCase();

    if (lower.includes('scooter') || lower.includes('nihal') || lower.includes('suhail')) {
      return 'scooter-legend';
    }
    if (lower.includes('jungle') || lower.includes('tribal')) {
      return 'jungle-mode';
    }
    if (lower.includes('himalaya') || lower.includes('chai') || lower.includes('tea')) {
      return 'chai-master';
    }
    if (lower.includes('hen') || lower.includes('farm') || lower.includes('poultry') || lower.includes('egg')) {
      return 'hen-farm-boss';
    }

    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    let matchedCount = 0;

    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const matchedId = matchFileToAdventure(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        if (matchedId) {
          onPhotoUploaded(matchedId, dataUrl, file.name);
          matchedCount++;
          sound.playHint();
        } else {
          // If only 1 file uploaded and not matched by name, find first unfilled or scooter
          const unfilled = ADVENTURES.find((a) => !customPhotos[a.id]);
          const targetId = unfilled ? unfilled.id : 'scooter-legend';
          onPhotoUploaded(targetId, dataUrl, file.name);
          matchedCount++;
          sound.playHint();
        }
      };

      reader.readAsDataURL(file);
    });

    if (fileArray.length > 0) {
      setStatusMessage(`Loaded ${fileArray.length} photo(s) with 100% original facial features!`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const customCount = Object.keys(customPhotos).length;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl p-5 sm:p-6 border-3 transition-all duration-300 text-center backdrop-blur-md shadow-md ${
          isDragging
            ? 'border-amber-500 bg-amber-100/90 scale-[1.01] shadow-xl'
            : 'border-amber-300/80 bg-white/90 hover:bg-amber-50/50 hover:border-amber-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Icon & Text */}
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
              <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Fredoka',sans-serif]">
                  Load Your Exact 4 Uploaded Photos
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  100% UNTOUCHED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Click or drop your original files (<code>scooter.jpg</code>, <code>jungle.png</code>, <code>himalaya.png</code>, <code>hen-farm.png</code>). Zero alterations!
              </p>
            </div>
          </div>

          {/* Right Button */}
          <div className="shrink-0 flex flex-col sm:items-end gap-1">
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Select Photos from Computer</span>
            </button>
            <span className="text-[11px] text-slate-400 font-semibold text-center sm:text-right">
              {customCount > 0 ? `${customCount} of 4 original photos active` : 'Supports multi-file select'}
            </span>
          </div>
        </div>

        {/* Status Message popup */}
        {statusMessage && (
          <div className="mt-3 py-1.5 px-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold inline-flex items-center gap-1.5 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 4 Mini Badges showing status of each adventure */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-amber-200/60 text-left">
          {ADVENTURES.map((adv) => {
            const hasCustom = !!customPhotos[adv.id];

            return (
              <div
                key={adv.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasCustom) {
                    onClearCustomPhoto(adv.id);
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-1 transition-all ${
                  hasCustom
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 hover:bg-rose-50 hover:border-rose-300'
                    : 'bg-amber-50/50 border-amber-200/60 text-slate-600 hover:bg-amber-100'
                }`}
                title={hasCustom ? 'Click to reset to default' : 'Click to load original file'}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span>{adv.emoji}</span>
                  <span className="font-bold truncate text-[11px]">{adv.title.split(' ')[0]}</span>
                </div>
                {hasCustom ? (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                    ✓ Original
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-amber-700">
                    + Load
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
