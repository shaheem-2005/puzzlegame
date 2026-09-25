import React from 'react';
import { Sparkles, Flame, CheckCircle2, Trophy, Clock, Shuffle } from 'lucide-react';
import { GameProgress } from '../types/puzzle';

interface HeroProps {
  progress: GameProgress;
  onScrollToCards: () => void;
  onOpenFinalModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ progress, onScrollToCards, onOpenFinalModal }) => {
  const completedCount = Object.values(progress.completedPuzzles).filter(Boolean).length;
  const isAllDone = completedCount >= 4;

  // Calculate total score & moves across all best scores
  let totalScore = 0;
  let totalMoves = 0;
  let totalTime = 0;

  Object.values(progress.bestScores).forEach((diffMap) => {
    Object.values(diffMap).forEach((rec) => {
      if (rec) {
        totalScore += rec.score;
        totalMoves += rec.moves;
        totalTime += rec.timeSeconds;
      }
    });
  });

  return (
    <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 text-center px-4">
      {/* Playful background decorative blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-gradient-to-tr from-amber-300/30 via-orange-300/20 to-yellow-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Comic Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold shadow-xs mb-4 animate-bounce">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>4 Epic Adventures of One True Legend</span>
          <span className="text-base">🛵🌴☕🐔</span>
        </div>

        {/* Large Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 font-['Fredoka',sans-serif] leading-tight sm:leading-none mb-4">
          THE LEGEND PUZZLE <span className="inline-block animate-pulse">🧩😂</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 mb-6 font-['Fredoka',sans-serif]">
          Can you complete all his adventures?
        </p>

        {/* Humorous blurb */}
        <p className="max-w-2xl text-slate-600 text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
          From riding scooters with zero navigation, to negotiating with sunglasses-wearing monkeys in the jungle,
          brewing high-altitude Himalayan chai, and managing 500 clucking hens: slide the scrambled pieces to reconstruct
          the hilarious saga!
        </p>

        {/* Action Buttons & Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={onScrollToCards}
            className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base sm:text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>START PUZZLE QUEST</span>
            <span className="text-xl">👉</span>
          </button>

          {isAllDone && (
            <button
              onClick={onOpenFinalModal}
              className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-base sm:text-lg shadow-md active:scale-95 transition-all flex items-center gap-2 border border-amber-400/40"
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>VIEW HALL OF FAME 🏆</span>
            </button>
          )}
        </div>

        {/* Mini stats cards bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-3xl">
          <div className="bg-white/80 backdrop-blur-xs border border-amber-200/90 rounded-2xl p-3.5 shadow-xs flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500">Adventures Solved</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-black text-slate-900 font-['Fredoka',sans-serif]">
                {completedCount} / 4
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-amber-200/90 rounded-2xl p-3.5 shadow-xs flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500">Total Score</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xl font-black text-amber-600 font-['Fredoka',sans-serif]">
                {totalScore.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-amber-200/90 rounded-2xl p-3.5 shadow-xs flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500">Total Moves</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shuffle className="w-4 h-4 text-blue-500" />
              <span className="text-xl font-black text-slate-900 font-['Fredoka',sans-serif]">
                {totalMoves}
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs border border-amber-200/90 rounded-2xl p-3.5 shadow-xs flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500">Legend Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl font-black text-orange-600 font-['Fredoka',sans-serif]">
                {isAllDone ? '🔥 GOD LEVEL' : completedCount > 0 ? '⚡ CHARGING' : '🌱 ROOKIE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
