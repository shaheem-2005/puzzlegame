import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Shuffle, Sparkles, ArrowRight, RotateCcw, Home, Award } from 'lucide-react';
import { Adventure, Difficulty } from '../types/puzzle';
import { formatTime } from '../utils/puzzleLogic';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  adventure: Adventure;
  imageUrl: string;
  difficulty: Difficulty;
  timeSeconds: number;
  moves: number;
  score: number;
  isNewBest: boolean;
  onNextPuzzle: () => void;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  adventure,
  imageUrl,
  difficulty,
  timeSeconds,
  moves,
  score,
  isNewBest,
  onNextPuzzle,
  onPlayAgain,
  onHome,
}) => {
  // Fire celebratory confetti on mount!
  useEffect(() => {
    sound.playVictory();

    // Multiphase confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border-4 border-amber-400 p-5 sm:p-7 text-center shadow-2xl overflow-hidden my-auto">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Trophy Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-3xl sm:text-4xl mb-3 animate-bounce">
          🏆
        </div>

        {/* Large Celebration Titles */}
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Fredoka',sans-serif] tracking-tight mb-1">
          LEGENDARY! 😂🔥
        </h2>
        <p className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 font-['Fredoka',sans-serif] mb-4">
          MISSION ACCOMPLISHED 😂🔥
        </p>

        {isNewBest && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs sm:text-sm shadow-md mb-4 animate-pulse">
            <Award className="w-4 h-4" />
            <span>NEW ALL-TIME RECORD! 🌟</span>
          </div>
        )}

        {/* Completed Photo Display */}
        <div className="relative mx-auto w-48 sm:w-60 aspect-square rounded-2xl overflow-hidden border-4 border-amber-300 shadow-xl mb-5 group">
          <img
            src={imageUrl}
            alt={adventure.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white">
            <p className="font-extrabold text-xs sm:text-sm font-['Fredoka',sans-serif]">
              {adventure.title}
            </p>
          </div>
        </div>

        {/* Stats Grid: Time, Moves, Score */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 sm:p-4 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Time
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {formatTime(timeSeconds)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5 text-blue-600" /> Moves
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {moves}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Score
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-600 font-mono mt-0.5">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Adventure Funny Quote */}
        <p className="text-xs sm:text-sm font-medium text-slate-600 italic mb-6 px-2">
          "{adventure.funnyQuote}"
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
          <button
            onClick={onNextPuzzle}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>NEXT PUZZLE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm sm:text-base border border-slate-300 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onHome}
            className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm sm:text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
