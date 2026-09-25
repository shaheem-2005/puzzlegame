import React, { useEffect, useRef } from 'react';
import { canMoveTile, executeMove, moveByDirection } from '../utils/puzzleLogic';
import { sound } from '../utils/audio';

interface PuzzleBoardProps {
  board: number[];
  size: number;
  imageUrl: string;
  isSolved: boolean;
  showNumbers: boolean;
  hintActive: boolean;
  onMove: (newBoard: number[]) => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  board,
  size,
  imageUrl,
  isSolved,
  showNumbers,
  hintActive,
  onMove,
}) => {
  const emptyVal = size * size - 1;
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (isSolved) return;

    if (canMoveTile(board, index, size)) {
      const nextBoard = executeMove(board, index, size);
      if (nextBoard) {
        sound.playSlide();
        onMove(nextBoard);
      }
    } else {
      sound.playInvalid();
    }
  };

  // Keyboard navigation: Arrow keys & WASD
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolved) return;

      let dir: 'up' | 'down' | 'left' | 'right' | null = null;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dir = 'up';
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dir = 'down';
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dir = 'left';
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dir = 'right';

      if (dir) {
        e.preventDefault();
        const nextBoard = moveByDirection(board, dir, size);
        if (nextBoard) {
          sound.playSlide();
          onMove(nextBoard);
        } else {
          sound.playInvalid();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, size, isSolved, onMove]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isSolved) return;
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const minSwipeDistance = 25;

    if (Math.max(absX, absY) > minSwipeDistance) {
      let dir: 'up' | 'down' | 'left' | 'right' | null = null;
      if (absX > absY) {
        dir = dx > 0 ? 'right' : 'left';
      } else {
        dir = dy > 0 ? 'down' : 'up';
      }

      if (dir) {
        const nextBoard = moveByDirection(board, dir, size);
        if (nextBoard) {
          sound.playSlide();
          onMove(nextBoard);
        }
      }
    }

    touchStartRef.current = null;
  };

  return (
    <div className="w-full flex justify-center items-center select-none py-2">
      <div
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-[360px] xs:max-w-[400px] sm:max-w-[480px] md:max-w-[520px] aspect-square rounded-3xl bg-amber-950/20 p-2 sm:p-3 border-4 border-amber-300/80 shadow-2xl shadow-orange-950/15 backdrop-blur-xs touch-none"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          gap: size === 3 ? '8px' : size === 4 ? '6px' : '4px',
        }}
      >
        {board.map((val, index) => {
          const isEmpty = val === emptyVal;
          const isMovable = !isSolved && !isEmpty && canMoveTile(board, index, size);
          const isCorrectPosition = val === index;

          if (isEmpty) {
            return (
              <div
                key={`empty-${index}`}
                className="relative rounded-xl sm:rounded-2xl border-2 border-dashed border-amber-400/40 bg-amber-950/10 flex items-center justify-center text-amber-600/40 font-bold transition-all"
              >
                <span className="text-[10px] sm:text-xs tracking-wider uppercase opacity-60">
                  Slide here
                </span>
              </div>
            );
          }

          // Calculate slice coordinates
          const origRow = Math.floor(val / size);
          const origCol = val % size;
          const posX = size > 1 ? (origCol / (size - 1)) * 100 : 0;
          const posY = size > 1 ? (origRow / (size - 1)) * 100 : 0;

          return (
            <button
              key={`tile-${val}`}
              onClick={() => handleTileClick(index)}
              disabled={isSolved}
              aria-label={`Tile ${val + 1}`}
              className={`relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-150 transform active:scale-95 shadow-md ${
                isMovable
                  ? 'cursor-pointer hover:brightness-105 hover:ring-2 hover:ring-amber-400 hover:shadow-lg'
                  : 'cursor-default'
              } ${
                hintActive && isCorrectPosition
                  ? 'ring-3 ring-emerald-500 shadow-emerald-500/30'
                  : ''
              }`}
              style={{
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: `${size * 100}% ${size * 100}%`,
                backgroundPosition: `${posX}% ${posY}%`,
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Tile Number Hint badge */}
              {(showNumbers || hintActive) && (
                <div
                  className={`absolute top-1.5 left-1.5 min-w-[22px] h-[22px] px-1 rounded-md text-[11px] sm:text-xs font-black flex items-center justify-center shadow-md backdrop-blur-xs transition-colors ${
                    isCorrectPosition
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/70 text-yellow-300'
                  }`}
                >
                  {val + 1}
                </div>
              )}

              {/* Correct position checkmark badge when hint is on */}
              {hintActive && isCorrectPosition && (
                <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
