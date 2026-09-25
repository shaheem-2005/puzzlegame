import React from 'react';
import { X, Play } from 'lucide-react';
import { Adventure } from '../types/puzzle';

interface PhotoModalProps {
  adventure: Adventure;
  imageUrl: string;
  onClose: () => void;
  onPlay: (adventure: Adventure) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  adventure,
  imageUrl,
  onClose,
  onPlay,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-all active:scale-95"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Photo */}
        <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={adventure.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Description & Action */}
        <div className="p-5 sm:p-6 bg-white text-left">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-2xl font-black text-slate-900 font-['Fredoka',sans-serif]">
              {adventure.title}
            </h3>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
              {adventure.badge}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-600 mb-3 leading-relaxed">
            {adventure.description}
          </p>

          <p className="text-xs sm:text-sm font-semibold text-amber-800 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200 mb-5">
            "{adventure.funnyQuote}"
          </p>

          <div className="flex gap-2.5">
            <button
              onClick={() => {
                onClose();
                onPlay(adventure);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>SOLVE THIS PUZZLE</span>
            </button>
            <button
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
