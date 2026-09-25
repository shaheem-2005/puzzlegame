import React from 'react';
import { Volume2, VolumeX, Trophy, Home, Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import { GameProgress } from '../types/puzzle';

interface HeaderProps {
  progress: GameProgress;
  currentView: 'home' | 'puzzle' | 'final';
  onNavigateHome: () => void;
  onOpenFinalModal: () => void;
  onSoundChange: (enabled: boolean) => void;
  soundEnabled: boolean;
  onResetProgress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  currentView,
  onNavigateHome,
  onOpenFinalModal,
  onSoundChange,
  soundEnabled,
  onResetProgress,
}) => {
  const completedCount = Object.values(progress.completedPuzzles).filter(Boolean).length;
  const isAllCompleted = completedCount >= 4;

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    onSoundChange(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-xl sm:text-2xl shadow-md shadow-orange-500/20 group-hover:rotate-6 transition-all duration-300">
            🧩
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-slate-900 font-['Fredoka',sans-serif]">
                THE LEGEND PUZZLE
              </span>
              <span className="text-lg sm:text-2xl">😂</span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-amber-700 hidden sm:block">
              Can you complete all his adventures?
            </p>
          </div>
        </button>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Progress Tracker Pill */}
          <button
            onClick={isAllCompleted ? onOpenFinalModal : onNavigateHome}
            title={isAllCompleted ? 'View Grand Legend Trophy!' : `${completedCount} of 4 adventures completed`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border transition-all ${
              isAllCompleted
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 border-amber-300 shadow-sm animate-pulse'
                : 'bg-amber-100/70 text-amber-900 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isAllCompleted ? (
              <>
                <Trophy className="w-4 h-4 text-amber-950 fill-amber-950" />
                <span>4 / 4 ALL DONE! 🏆</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{completedCount} / 4 Done</span>
              </>
            )}
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Sound is ON (Click to Mute)' : 'Sound is MUTED (Click to Unmute)'}
            className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
              soundEnabled
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm hover:bg-amber-600'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Home button if in puzzle mode */}
          {currentView === 'puzzle' && (
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          )}

          {/* Reset progress button if desired */}
          {completedCount > 0 && currentView === 'home' && (
            <button
              onClick={() => {
                if (window.confirm('Reset all puzzle completion progress and best scores?')) {
                  onResetProgress();
                }
              }}
              title="Reset best scores and progress"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all text-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
