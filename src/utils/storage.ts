import { Difficulty, GameProgress, ScoreRecord } from '../types/puzzle';

const STORAGE_KEY = 'the_legend_puzzle_v1_data';
const CUSTOM_IMAGES_KEY = 'the_legend_puzzle_custom_images';

export function loadGameProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved game progress', e);
  }

  return {
    completedPuzzles: {},
    bestScores: {},
    soundEnabled: true,
  };
}

export function saveGameProgress(progress: GameProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save game progress', e);
  }
}

export function recordScore(
  adventureId: string,
  difficulty: Difficulty,
  timeSeconds: number,
  moves: number,
  score: number
): { progress: GameProgress; isNewBest: boolean } {
  const progress = loadGameProgress();

  if (!progress.bestScores[adventureId]) {
    progress.bestScores[adventureId] = {};
  }

  const existingBest = progress.bestScores[adventureId]?.[difficulty];
  let isNewBest = false;

  const newRecord: ScoreRecord = {
    adventureId,
    difficulty,
    timeSeconds,
    moves,
    score,
    completedAt: new Date().toISOString(),
  };

  if (!existingBest || score > existingBest.score) {
    isNewBest = true;
    progress.bestScores[adventureId]![difficulty] = newRecord;
  }

  // Mark this adventure as completed
  progress.completedPuzzles[adventureId] = true;

  saveGameProgress(progress);
  return { progress, isNewBest };
}

export function getCustomImages(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_IMAGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setCustomImage(adventureId: string, dataUrl: string) {
  try {
    const images = getCustomImages();
    images[adventureId] = dataUrl;
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save custom image', e);
  }
}

export function clearCustomImage(adventureId: string) {
  try {
    const images = getCustomImages();
    delete images[adventureId];
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(images));
  } catch {
    // ignore
  }
}
