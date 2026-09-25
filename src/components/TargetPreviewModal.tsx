import React from 'react';
import { X, Eye } from 'lucide-react';
import { Adventure } from '../types/puzzle';

interface TargetPreviewModalProps {
  adventure: Adventure;
  imageUrl: string;
  onClose: () => void;
}

export const TargetPreviewModal: React.FC<TargetPreviewModalProps> = ({
  adventure,
  imageUrl,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border-4 border-amber-400 my-auto text-center">
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
          title="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-1.5 mb-3 text-slate-800 font-extrabold text-lg font-['Fredoka',sans-serif]">
          <Eye className="w-5 h-5 text-amber-500" />
          <span>Original Goal Image</span>
        </div>

        {/* Square Target Photo */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md mb-4 bg-slate-900">
          <img
            src={imageUrl}
            alt={adventure.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-xs sm:text-sm font-semibold text-slate-600 mb-4">
          Rearrange all sliding tiles to match this picture!
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm active:scale-95 transition-all shadow-md"
        >
          Got it! Back to Game
        </button>
      </div>
    </div>
  );
};
