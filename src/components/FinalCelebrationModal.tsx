import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Shuffle, Sparkles, CheckCircle2, RotateCcw, Home, Award } from 'lucide-react';
import { ADVENTURES } from '../data/adventures';
import { GameProgress } from '../types/puzzle';
import { formatTime } from '../utils/puzzleLogic';
import { sound } from '../utils/audio';

interface FinalCelebrationModalProps {
  progress: GameProgress;
  onPlayAgainAll: () => void;
  onSelectAdventure: (adventureId: string) => void;
  onClose: () => void;
}

export const FinalCelebrationModal: React.FC<FinalCelebrationModalProps> = ({
  progress,
  onPlayAgainAll,
  onSelectAdventure,
  onClose,
}) => {
  useEffect(() => {
    sound.playVictory();

    // Epic multi-wave fireworks confetti
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        particleCount,
        spread: 360,
        startVelocity: 30,
        origin: { x: Math.random(), y: Math.random() * 0.6 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#fbbf24'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // Compute aggregate statistics
  let totalMoves = 0;
  let totalTimeSeconds = 0;
  let overallScore = 0;
  let highestSingleScore = 0;

  Object.values(progress.bestScores).forEach((diffMap) => {
    Object.values(diffMap).forEach((rec) => {
      if (rec) {
        totalMoves += rec.moves;
        totalTimeSeconds += rec.timeSeconds;
        overallScore += rec.score;
        if (rec.score > highestSingleScore) {
          highestSingleScore = rec.score;
        }
      }
    });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border-4 border-amber-400 p-5 sm:p-8 text-center shadow-2xl overflow-hidden my-auto">
        {/* Confetti / Trophy header banner */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/40 text-4xl sm:text-5xl mb-3 animate-bounce">
          🏆
        </div>

        {/* Large Main Heading as required by prompt */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-['Fredoka',sans-serif] tracking-tight mb-2">
          THE LEGEND HAS FINISHED ALL 4!
        </h2>
        <p className="text-base sm:text-xl font-bold text-amber-600 font-['Fredoka',sans-serif] mb-6">
          You conquered the Scooter, the Jungle, the Himalayas, and the Hen Farm! 😂🔥
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/90 rounded-2xl p-3 sm:p-5 mb-6 shadow-xs">
          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed
            </span>
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono mt-0.5">
              4 / 4
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Total Time
            </span>
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono mt-0.5">
              {formatTime(totalTimeSeconds)}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Shuffle className="w-3.5 h-3.5 text-blue-600" /> Total Moves
            </span>
            <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono mt-0.5">
              {totalMoves}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Overall Score
            </span>
            <span className="text-xl sm:text-3xl font-black text-amber-600 font-mono mt-0.5">
              {overallScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Best Single Score Highlight */}
        <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold mb-6">
          <Award className="w-4 h-4 text-orange-500" />
          <span>Best Single Puzzle Score: <strong>{highestSingleScore.toLocaleString()} points</strong></span>
        </div>

        {/* 4 Adventures Hall of Fame Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
          {ADVENTURES.map((adv) => (
            <button
              key={adv.id}
              onClick={() => onSelectAdventure(adv.id)}
              className="bg-white rounded-2xl p-2 border-2 border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left flex flex-col group"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden mb-1.5 bg-slate-100">
                <img
                  src={adv.image}
                  alt={adv.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="font-extrabold text-xs text-slate-900 line-clamp-1 font-['Fredoka',sans-serif]">
                {adv.title}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">
                ✓ Mastered
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Large "PLAY AGAIN" Button as required by prompt */}
          <button
            onClick={onPlayAgainAll}
            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-lg sm:text-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
