import React, { useState } from 'react';
import { Play, Eye, Trophy, Sparkles, CheckCircle2, Upload, RotateCcw } from 'lucide-react';
import { Adventure, Difficulty, ScoreRecord } from '../types/puzzle';

interface AdventureCardProps {
  adventure: Adventure;
  isCompleted: boolean;
  bestScores?: Partial<Record<Difficulty, ScoreRecord>>;
  customImage?: string;
  onPlay: (adventure: Adventure) => void;
  onPreview: (adventure: Adventure) => void;
  onCustomImageUpload: (adventureId: string, dataUrl: string) => void;
  onResetCustomImage: (adventureId: string) => void;
}

export const AdventureCard: React.FC<AdventureCardProps> = ({
  adventure,
  isCompleted,
  bestScores,
  customImage,
  onPlay,
  onPreview,
  onCustomImageUpload,
  onResetCustomImage,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(customImage || adventure.image);
  const [imgLoaded, setImgLoaded] = useState<boolean>(false);

  const effectiveImage = customImage || imgSrc;

  const handleImageError = () => {
    // If primary path fails, try fallback path
    if (imgSrc !== adventure.fallbackImage) {
      setImgSrc(adventure.fallbackImage);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onCustomImageUpload(adventure.id, result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Find best score among difficulties
  const easyBest = bestScores?.easy;
  const medBest = bestScores?.medium;
  const hardBest = bestScores?.hard;

  const hasAnyBest = easyBest || medBest || hardBest;

  return (
    <div className="group relative bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-200/80 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100/90 text-amber-900 border border-amber-300/80 flex items-center gap-1">
          <span>{adventure.emoji}</span>
          <span>{adventure.badge}</span>
        </span>

        {isCompleted ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>SOLVED!</span>
          </span>
        ) : customImage ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300">
            <span>✓ Original Loaded</span>
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400">Not Solved Yet</span>
        )}
      </div>

      {/* Photo Frame Container */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 mb-3 group/img">
        <img
          src={effectiveImage}
          alt={adventure.title}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Loading skeleton placeholder */}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 animate-pulse text-slate-400 text-sm font-bold">
            Loading {adventure.title}...
          </div>
        )}

        {/* Original photo active chip */}
        {customImage && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-emerald-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs shadow-md">
            Original Photo
          </div>
        )}

        {/* Overlay hover actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
          <button
            onClick={() => onPreview(adventure)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 text-xs font-bold shadow-md backdrop-blur-xs transition-all active:scale-95"
            title="Inspect original photo in full resolution"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Inspect</span>
          </button>

          <label
            title="Select your exact original photo for this adventure"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{customImage ? 'Change Photo' : 'Upload Original'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {customImage && (
          <button
            onClick={() => onResetCustomImage(adventure.id)}
            title="Reset to default photo"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs shadow-md"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Direct One-Click Load Original Button under image */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <label
          className="flex-1 py-1.5 px-2.5 rounded-xl border border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/70 hover:bg-amber-100/70 text-amber-900 font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5"
          title="Load your original photo for this adventure"
        >
          <Upload className="w-3.5 h-3.5 text-amber-600" />
          <span>{customImage ? 'Replace Original Photo' : 'Use Exact Original Photo'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Adventure Title & Subtitle */}
      <div className="mb-4">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Fredoka',sans-serif] tracking-tight mb-1 flex items-center justify-between">
          <span>{adventure.title}</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium line-clamp-2 leading-relaxed">
          {adventure.subtitle}
        </p>
      </div>

      {/* Best Scores Pills (if any) */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 mb-4 text-xs">
        <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-700">
            <Trophy className="w-3 h-3 text-amber-600" /> Best Records
          </span>
          {hasAnyBest && (
            <span className="text-[11px] text-amber-600">
              High: {Math.max(easyBest?.score || 0, medBest?.score || 0, hardBest?.score || 0)} pts
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-semibold text-slate-600">
          <div className="bg-white rounded-lg py-1 px-1 border border-amber-200/50">
            <div className="text-[10px] text-slate-400 font-bold">EASY (3×3)</div>
            <div className="font-extrabold text-slate-800">
              {easyBest ? `${easyBest.score} pts` : '—'}
            </div>
          </div>
          <div className="bg-white rounded-lg py-1 px-1 border border-amber-200/50">
            <div className="text-[10px] text-slate-400 font-bold">MED (4×4)</div>
            <div className="font-extrabold text-slate-800">
              {medBest ? `${medBest.score} pts` : '—'}
            </div>
          </div>
          <div className="bg-white rounded-lg py-1 px-1 border border-amber-200/50">
            <div className="text-[10px] text-slate-400 font-bold">HARD (5×5)</div>
            <div className="font-extrabold text-slate-800">
              {hardBest ? `${hardBest.score} pts` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Large PLAY PUZZLE Button */}
      <button
        onClick={() => onPlay(adventure)}
        className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base sm:text-lg tracking-wide uppercase shadow-lg shadow-orange-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 group-hover:shadow-orange-500/40"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>PLAY PUZZLE</span>
      </button>
    </div>
  );
};
