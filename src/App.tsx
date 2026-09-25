/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AdventureCard } from './components/AdventureCard';
import { PuzzleBoard } from './components/PuzzleBoard';
import { GameControls } from './components/GameControls';
import { VictoryModal } from './components/VictoryModal';
import { FinalCelebrationModal } from './components/FinalCelebrationModal';
import { PhotoModal } from './components/PhotoModal';
import { TargetPreviewModal } from './components/TargetPreviewModal';
import { PhotoDropzone } from './components/PhotoDropzone';

import { ADVENTURES, DIFFICULTY_CONFIGS, FUNNY_MESSAGES } from './data/adventures';
import { Adventure, Difficulty, GameProgress } from './types/puzzle';
import {
  createSolvedBoard,
  shuffleBoard,
  isBoardSolved,
  calculateScore,
  getCorrectTilesCount,
} from './utils/puzzleLogic';
import {
  loadGameProgress,
  saveGameProgress,
  recordScore,
  getCustomImages,
  setCustomImage,
  clearCustomImage,
} from './utils/storage';
import {
  getAllOriginalPhotos,
  saveOriginalPhoto,
  deleteOriginalPhoto,
} from './utils/photoDb';
import { sound } from './utils/audio';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<'home' | 'puzzle'>('home');
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure>(ADVENTURES[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');

  // Game Play State
  const [board, setBoard] = useState<number[]>(() =>
    createSolvedBoard(DIFFICULTY_CONFIGS.easy.size)
  );
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [moves, setMoves] = useState<number>(0);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [hintActive, setHintActive] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.isEnabled());

  // Storage / Persistence State
  const [progress, setProgress] = useState<GameProgress>(loadGameProgress);
  const [customImages, setCustomImages] = useState<Record<string, string>>(getCustomImages);

  // Load high-resolution photos from IndexedDB on initial mount
  useEffect(() => {
    getAllOriginalPhotos().then((dbPhotos) => {
      if (Object.keys(dbPhotos).length > 0) {
        setCustomImages((prev) => ({ ...prev, ...dbPhotos }));
      }
    });
  }, []);

  // Modals State
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [showFinalModal, setShowFinalModal] = useState<boolean>(false);
  const [previewPhotoAdventure, setPreviewPhotoAdventure] = useState<Adventure | null>(null);
  const [showTargetPreviewModal, setShowTargetPreviewModal] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Dynamic Funny Message Ticker
  const [funnyMsgIndex, setFunnyMsgIndex] = useState<number>(0);

  // Cards Section ref for smooth scrolling
  const cardsSectionRef = useRef<HTMLDivElement>(null);

  const currentSize = DIFFICULTY_CONFIGS[difficulty].size;
  const totalTiles = currentSize * currentSize - 1; // excluding empty slot

  // Image source for the active adventure
  const currentImageUrl = useMemo(() => {
    return (
      customImages[selectedAdventure.id] ||
      selectedAdventure.image ||
      selectedAdventure.fallbackImage
    );
  }, [customImages, selectedAdventure]);

  // Projected current score
  const currentScore = useMemo(() => {
    return calculateScore(difficulty, moves, timeSeconds);
  }, [difficulty, moves, timeSeconds]);

  // Correct tiles placed
  const correctTilesCount = useMemo(() => {
    return getCorrectTilesCount(board);
  }, [board]);

  // Timer interval effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (currentView === 'puzzle' && isGameActive && !isSolved) {
      timer = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentView, isGameActive, isSolved]);

  // Funny messages rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setFunnyMsgIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Initialize or start puzzle for an adventure
  const startPuzzle = (adventure: Adventure, diff: Difficulty = difficulty) => {
    setSelectedAdventure(adventure);
    setDifficulty(diff);
    const size = DIFFICULTY_CONFIGS[diff].size;
    const shuffled = shuffleBoard(size);

    setBoard(shuffled);
    setMoves(0);
    setTimeSeconds(0);
    setIsSolved(false);
    setIsGameActive(true);
    setHintActive(false);
    setShowVictoryModal(false);
    setCurrentView('puzzle');
    sound.playShuffle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shuffle currently active puzzle
  const handleShuffle = () => {
    const size = DIFFICULTY_CONFIGS[difficulty].size;
    const shuffled = shuffleBoard(size);
    setBoard(shuffled);
    setMoves(0);
    setTimeSeconds(0);
    setIsSolved(false);
    setIsGameActive(true);
    setShowVictoryModal(false);
    sound.playShuffle();
  };

  // Change difficulty in game
  const handleDifficultyChange = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    const size = DIFFICULTY_CONFIGS[newDiff].size;
    const shuffled = shuffleBoard(size);
    setBoard(shuffled);
    setMoves(0);
    setTimeSeconds(0);
    setIsSolved(false);
    setIsGameActive(true);
    setShowVictoryModal(false);
    sound.playShuffle();
  };

  // Tile Move handler
  const handleMove = (newBoard: number[]) => {
    setBoard(newBoard);
    const nextMoves = moves + 1;
    setMoves(nextMoves);

    // Change funny message occasionally on moves
    if (nextMoves % 7 === 0) {
      setFunnyMsgIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
    }

    // Check if puzzle is solved!
    if (isBoardSolved(newBoard)) {
      setIsSolved(true);
      setIsGameActive(false);

      const finalScore = calculateScore(difficulty, nextMoves, timeSeconds);
      const { progress: updatedProgress, isNewBest } = recordScore(
        selectedAdventure.id,
        difficulty,
        timeSeconds,
        nextMoves,
        finalScore
      );

      setProgress(updatedProgress);
      setIsNewRecord(isNewBest);

      // Trigger Victory modal after a brief delightful pause
      setTimeout(() => {
        setShowVictoryModal(true);
      }, 350);
    }
  };

  // Next / Prev adventure navigation
  const handleNextAdventure = () => {
    const currentIndex = ADVENTURES.findIndex((a) => a.id === selectedAdventure.id);
    const nextIndex = (currentIndex + 1) % ADVENTURES.length;
    startPuzzle(ADVENTURES[nextIndex], difficulty);
  };

  const handlePrevAdventure = () => {
    const currentIndex = ADVENTURES.findIndex((a) => a.id === selectedAdventure.id);
    const prevIndex = (currentIndex - 1 + ADVENTURES.length) % ADVENTURES.length;
    startPuzzle(ADVENTURES[prevIndex], difficulty);
  };

  // Custom photo overrides
  const handleCustomImageUpload = async (adventureId: string, dataUrl: string, fileName?: string) => {
    await saveOriginalPhoto(adventureId, dataUrl, fileName);
    setCustomImage(adventureId, dataUrl);
    setCustomImages((prev) => ({ ...prev, [adventureId]: dataUrl }));
  };

  const handleResetCustomImage = async (adventureId: string) => {
    await deleteOriginalPhoto(adventureId);
    clearCustomImage(adventureId);
    setCustomImages((prev) => {
      const next = { ...prev };
      delete next[adventureId];
      return next;
    });
  };

  const handleResetProgress = () => {
    localStorage.removeItem('the_legend_puzzle_v1_data');
    setProgress(loadGameProgress());
  };

  const scrollToCards = () => {
    cardsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const completedCount = Object.values(progress.completedPuzzles).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Header */}
      <Header
        progress={progress}
        currentView={currentView}
        onNavigateHome={() => {
          sound.playClick();
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenFinalModal={() => setShowFinalModal(true)}
        onSoundChange={(enabled) => setSoundEnabled(enabled)}
        soundEnabled={soundEnabled}
        onResetProgress={handleResetProgress}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {currentView === 'home' ? (
          /* ================= HOME VIEW ================= */
          <div className="space-y-10 sm:space-y-14">
            {/* Hero Section */}
            <Hero
              progress={progress}
              onScrollToCards={scrollToCards}
              onOpenFinalModal={() => setShowFinalModal(true)}
            />

            {/* Photo Dropzone for 1-click loading original 4 photos */}
            <PhotoDropzone
              customPhotos={customImages}
              onPhotoUploaded={handleCustomImageUpload}
              onClearCustomPhoto={handleResetCustomImage}
            />

            {/* Photo Cards Grid Section */}
            <section ref={cardsSectionRef} className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🏆</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Fredoka',sans-serif]">
                      Choose an Adventure to Solve
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Select any photo to start sliding. Reconstruct the legendary moments!
                  </p>
                </div>
                <div className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-full border border-amber-300 w-fit">
                  {completedCount} of 4 Adventures Completed
                </div>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {ADVENTURES.map((adventure) => {
                  const isCompleted = !!progress.completedPuzzles[adventure.id];
                  const bestMap = progress.bestScores[adventure.id];
                  const customImg = customImages[adventure.id];

                  return (
                    <AdventureCard
                      key={adventure.id}
                      adventure={adventure}
                      isCompleted={isCompleted}
                      bestScores={bestMap}
                      customImage={customImg}
                      onPlay={(adv) => startPuzzle(adv)}
                      onPreview={(adv) => setPreviewPhotoAdventure(adv)}
                      onCustomImageUpload={handleCustomImageUpload}
                      onResetCustomImage={handleResetCustomImage}
                    />
                  );
                })}
              </div>
            </section>

            {/* How to Play & Rules Guide */}
            <section className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-sm max-w-4xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Fredoka',sans-serif] mb-4 flex items-center gap-2">
                <span>🎮 How to Play The Legend Puzzle</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 flex flex-col gap-1.5">
                  <span className="text-2xl">👆</span>
                  <strong className="text-slate-900 font-bold">1. Click or Swipe</strong>
                  <p className="text-xs leading-relaxed">
                    Click any tile adjacent to the empty slot to slide it. On mobile, swipe in the direction you want to move!
                  </p>
                </div>
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 flex flex-col gap-1.5">
                  <span className="text-2xl">💡</span>
                  <strong className="text-slate-900 font-bold">2. Use Hints & Numbers</strong>
                  <p className="text-xs leading-relaxed">
                    Stuck? Turn on the <strong>Hint</strong> or <strong>Numbers</strong> button to see which tiles are placed correctly and follow the numbers.
                  </p>
                </div>
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 flex flex-col gap-1.5">
                  <span className="text-2xl">🏆</span>
                  <strong className="text-slate-900 font-bold">3. Conquer All 4</strong>
                  <p className="text-xs leading-relaxed">
                    Solve all four adventures to unlock the official <strong>Legend Hall of Fame</strong> certificate and max out your score!
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ================= PUZZLE VIEW ================= */
          <div className="flex flex-col items-center space-y-6">
            {/* Controls Bar (Difficulty, Timer, Moves, Shuffle, Hint, Preview) */}
            <GameControls
              adventure={selectedAdventure}
              difficulty={difficulty}
              moves={moves}
              timeSeconds={timeSeconds}
              currentScore={currentScore}
              correctTilesCount={correctTilesCount}
              totalTiles={totalTiles}
              hintActive={hintActive}
              showNumbers={showNumbers}
              soundEnabled={soundEnabled}
              activeFunnyMessage={FUNNY_MESSAGES[funnyMsgIndex]}
              onDifficultyChange={handleDifficultyChange}
              onShuffle={handleShuffle}
              onToggleHint={() => {
                sound.playHint();
                setHintActive((prev) => !prev);
              }}
              onToggleNumbers={() => {
                sound.playClick();
                setShowNumbers((prev) => !prev);
              }}
              onTogglePreviewModal={() => setShowTargetPreviewModal(true)}
              onToggleSound={() => {
                const s = sound.toggleSound();
                setSoundEnabled(s);
              }}
              onHome={() => {
                sound.playClick();
                setCurrentView('home');
              }}
              onNextAdventure={handleNextAdventure}
              onPrevAdventure={handlePrevAdventure}
            />

            {/* Interactive Puzzle Board */}
            <PuzzleBoard
              board={board}
              size={currentSize}
              imageUrl={currentImageUrl}
              isSolved={isSolved}
              showNumbers={showNumbers}
              hintActive={hintActive}
              onMove={handleMove}
            />

            {/* In-Game Original Photo indicator & swap option */}
            <div className="flex items-center justify-between gap-3 max-w-sm sm:max-w-md w-full bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-amber-200/90 shadow-xs text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                {customImages[selectedAdventure.id] ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-800 font-black">100% Original Photo Active</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-slate-600">Want your exact unedited file?</span>
                  </>
                )}
              </div>
              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold transition-all text-[11px] active:scale-95">
                <span>{customImages[selectedAdventure.id] ? 'Change' : '📁 Load Exact File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const data = ev.target?.result as string;
                        if (data) handleCustomImageUpload(selectedAdventure.id, data, file.name);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Helper tips under board */}
            <div className="text-center text-xs text-slate-500 font-medium max-w-md px-4">
              <span className="inline-block bg-white/70 px-3 py-1.5 rounded-full border border-amber-200">
                ⌨️ Desktop tip: Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to slide tiles!
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-amber-200/80 bg-white/60 py-6 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-700 font-['Fredoka',sans-serif] text-sm mb-1">
          THE LEGEND PUZZLE 🧩😂
        </p>
        <p>Celebrating the hilarious adventures of Nihal Suhail: Scooter, Jungle, Chai & Hens.</p>
      </footer>

      {/* Victory Celebration Modal */}
      {showVictoryModal && (
        <VictoryModal
          adventure={selectedAdventure}
          imageUrl={currentImageUrl}
          difficulty={difficulty}
          timeSeconds={timeSeconds}
          moves={moves}
          score={currentScore}
          isNewBest={isNewRecord}
          onNextPuzzle={() => {
            setShowVictoryModal(false);
            // If all 4 completed, open final celebration!
            const count = Object.values(progress.completedPuzzles).filter(Boolean).length;
            if (count >= 4) {
              setShowFinalModal(true);
            } else {
              handleNextAdventure();
            }
          }}
          onPlayAgain={() => {
            setShowVictoryModal(false);
            handleShuffle();
          }}
          onHome={() => {
            setShowVictoryModal(false);
            setCurrentView('home');
          }}
        />
      )}

      {/* Final 4/4 Hall of Fame Modal */}
      {showFinalModal && (
        <FinalCelebrationModal
          progress={progress}
          onPlayAgainAll={() => {
            setShowFinalModal(false);
            startPuzzle(ADVENTURES[0], 'medium');
          }}
          onSelectAdventure={(advId) => {
            setShowFinalModal(false);
            const adv = ADVENTURES.find((a) => a.id === advId) || ADVENTURES[0];
            startPuzzle(adv, difficulty);
          }}
          onClose={() => setShowFinalModal(false)}
        />
      )}

      {/* Inspect Photo Modal */}
      {previewPhotoAdventure && (
        <PhotoModal
          adventure={previewPhotoAdventure}
          imageUrl={
            customImages[previewPhotoAdventure.id] ||
            previewPhotoAdventure.image ||
            previewPhotoAdventure.fallbackImage
          }
          onClose={() => setPreviewPhotoAdventure(null)}
          onPlay={(adv) => {
            setPreviewPhotoAdventure(null);
            startPuzzle(adv);
          }}
        />
      )}

      {/* Target Goal Preview Modal in Game */}
      {showTargetPreviewModal && (
        <TargetPreviewModal
          adventure={selectedAdventure}
          imageUrl={currentImageUrl}
          onClose={() => setShowTargetPreviewModal(false)}
        />
      )}
    </div>
  );
}
