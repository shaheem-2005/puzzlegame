import React, { useState } from 'react';
import {
  Timer as TimerIcon,
  Shuffle,
  Lightbulb,
  Eye,
  Volume2,
  VolumeX,
  Home,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { Adventure, Difficulty } from '../types/puzzle';
import { DIFFICULTY_CONFIGS, FUNNY_MESSAGES } from '../data/adventures';
import { formatTime } from '../utils/puzzleLogic';
import { sound } from '../utils/audio';

interface GameControlsProps {
  adventure: Adventure;
  difficulty: Difficulty;
  moves: number;
  timeSeconds: number;
  currentScore: number;
  correctTilesCount: number;
  totalTiles: number;
  hintActive: boolean;
  showNumbers: boolean;
  soundEnabled: boolean;
  activeFunnyMessage: string;
  onDifficultyChange: (newDifficulty: Difficulty) => void;
  onShuffle: () => void;
  onToggleHint: () => void;
  onToggleNumbers: () => void;
  onTogglePreviewModal: () => void;
  onToggleSound: () => void;
  onHome: () => void;
  onNextAdventure: () => void;
  onPrevAdventure: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  adventure,
  difficulty,
  moves,
  timeSeconds,
  currentScore,
  correctTilesCount,
  totalTiles,
  hintActive,
  showNumbers,
  soundEnabled,
  activeFunnyMessage,
  onDifficultyChange,
  onShuffle,
  onToggleHint,
  onToggleNumbers,
  onTogglePreviewModal,
  onToggleSound,
  onHome,
  onNextAdventure,
  onPrevAdventure,
}) => {
  const [showPreviewMini, setShowPreviewMini] = useState<boolean>(false);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 px-2 sm:px-4">
      {/* Top Header Row with Navigation & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95"
            title="Return to Home Adventures"
          >
            <Home className="w-4 h-4" />
            <span className="hidden xs:inline">Home</span>
          </button>

          {/* Prev/Next buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevAdventure}
              title="Previous Adventure"
              className="p-1.5 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-amber-900 transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-extrabold text-xs sm:text-sm">
              Puzzle {adventure.order} / 4
            </span>
            <button
              onClick={onNextAdventure}
              title="Next Adventure"
              className="p-1.5 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-amber-900 transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Adventure Title */}
        <div className="flex items-center gap-2 text-right">
          <span className="text-xl sm:text-2xl">{adventure.emoji}</span>
          <span className="font-extrabold text-base sm:text-xl text-slate-900 font-['Fredoka',sans-serif]">
            {adventure.title}
          </span>
        </div>
      </div>

      {/* Difficulty Selector Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Difficulty:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
            const config = DIFFICULTY_CONFIGS[diff];
            const isCurrent = difficulty === diff;

            return (
              <button
                key={diff}
                onClick={() => {
                  sound.playClick();
                  onDifficultyChange(diff);
                }}
                className={`flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>{config.label}</span>
                <span className="text-[11px] opacity-80">({config.size}×{config.size})</span>
              </button>
            );
          })}
        </div>

        {/* Correct Pieces Progress */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>
            {correctTilesCount} / {totalTiles} Placed
          </span>
        </div>
      </div>

      {/* Live Stats Row: Timer, Moves, Projected Score */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {/* Timer */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-amber-200/80 shadow-xs flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <TimerIcon className="w-3.5 h-3.5 text-amber-500" /> Time
          </span>
          <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
            {formatTime(timeSeconds)}
          </span>
        </div>

        {/* Moves Counter */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-amber-200/80 shadow-xs flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Shuffle className="w-3.5 h-3.5 text-blue-500" /> Moves
          </span>
          <span className="text-xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight mt-0.5">
            {moves}
          </span>
        </div>

        {/* Score */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border-2 border-amber-200/80 shadow-xs flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <span className="text-amber-500">⭐</span> Score
          </span>
          <span className="text-xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight mt-0.5">
            {currentScore}
          </span>
        </div>
      </div>

      {/* Funny Dynamic Speech Bubble */}
      <div className="relative bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border-2 border-amber-300/80 rounded-2xl p-3 sm:p-3.5 text-center shadow-xs overflow-hidden">
        <div className="flex items-center justify-center gap-2">
          <span className="text-lg animate-bounce">💬</span>
          <p className="font-extrabold text-sm sm:text-base text-amber-950 font-['Fredoka',sans-serif]">
            "{activeFunnyMessage}"
          </p>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {/* Shuffle Button */}
        <button
          onClick={onShuffle}
          className="flex-1 min-w-[130px] py-2.5 sm:py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          title="Reshuffle the puzzle"
        >
          <Shuffle className="w-4 h-4" />
          <span>SHUFFLE</span>
        </button>

        {/* Hint Placement Button */}
        <button
          onClick={onToggleHint}
          className={`flex-1 min-w-[120px] py-2.5 sm:py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm border shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
            hintActive
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
          title="Highlight tiles in correct place and show numbers"
        >
          <Lightbulb className={`w-4 h-4 ${hintActive ? 'fill-white text-white' : 'text-emerald-600'}`} />
          <span>{hintActive ? 'HINT: ON' : 'HINT'}</span>
        </button>

        {/* Number Overlay Toggle */}
        <button
          onClick={onToggleNumbers}
          className={`py-2.5 sm:py-3 px-3.5 rounded-2xl font-extrabold text-xs sm:text-sm border shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
            showNumbers
              ? 'bg-indigo-600 text-white border-indigo-700'
              : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}
          title="Toggle number labels on tiles"
        >
          <Hash className="w-4 h-4" />
          <span className="hidden sm:inline">Numbers</span>
        </button>

        {/* Original Photo Preview Button */}
        <button
          onClick={onTogglePreviewModal}
          className="py-2.5 sm:py-3 px-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-extrabold text-xs sm:text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          title="View target full completed photo"
        >
          <Eye className="w-4 h-4 text-slate-700" />
          <span>Preview</span>
        </button>

        {/* Sound toggle button */}
        <button
          onClick={onToggleSound}
          className={`py-2.5 sm:py-3 px-3.5 rounded-2xl border font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 ${
            soundEnabled
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-slate-100 text-slate-400 border-slate-300'
          }`}
          title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
