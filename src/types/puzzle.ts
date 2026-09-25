export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  label: string;
  size: number;
  description: string;
  baseScore: number;
  minShuffleSteps: number;
}

export interface Adventure {
  id: string;
  order: number;
  title: string;
  emoji: string;
  subtitle: string;
  funnyQuote: string;
  description: string;
  image: string;
  fallbackImage: string;
  accentColor: string;
  bgGradient: string;
  badge: string;
}

export interface ScoreRecord {
  adventureId: string;
  difficulty: Difficulty;
  timeSeconds: number;
  moves: number;
  score: number;
  completedAt: string;
}

export interface GameProgress {
  completedPuzzles: Record<string, boolean>; // adventureId -> boolean
  bestScores: Record<string, Partial<Record<Difficulty, ScoreRecord>>>; // adventureId -> { easy: ..., medium: ..., hard: ... }
  soundEnabled: boolean;
}
