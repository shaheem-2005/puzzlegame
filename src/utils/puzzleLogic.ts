import { Difficulty, DifficultyConfig } from '../types/puzzle';
import { DIFFICULTY_CONFIGS } from '../data/adventures';

/**
 * Creates a solved board: [0, 1, 2, ..., size*size - 1]
 * where (size*size - 1) is the empty blank space.
 */
export function createSolvedBoard(size: number): number[] {
  const total = size * size;
  return Array.from({ length: total }, (_, i) => i);
}

/**
 * Checks if the board is in the completely solved state.
 */
export function isBoardSolved(board: number[]): boolean {
  if (board.length === 0) return false;
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== i) return false;
  }
  return true;
}

/**
 * Returns valid neighbor indices of the given index that can swap with it.
 */
export function getNeighbors(index: number, size: number): number[] {
  const neighbors: number[] = [];
  const row = Math.floor(index / size);
  const col = index % size;

  // Up
  if (row > 0) neighbors.push(index - size);
  // Down
  if (row < size - 1) neighbors.push(index + size);
  // Left
  if (col > 0) neighbors.push(index - 1);
  // Right
  if (col < size - 1) neighbors.push(index + 1);

  return neighbors;
}

/**
 * Shuffles the board starting from the solved state by applying
 * a sequence of random valid sliding moves. This mathematically
 * guarantees that the puzzle is 100% SOLVABLE.
 */
export function shuffleBoard(size: number, customSteps?: number): number[] {
  const total = size * size;
  const board = createSolvedBoard(size);
  let emptyIndex = total - 1;
  let lastMovedIndex = -1;

  const steps = customSteps || (size === 3 ? 60 : size === 4 ? 110 : 180);

  for (let s = 0; s < steps; s++) {
    const neighbors = getNeighbors(emptyIndex, size).filter(n => n !== lastMovedIndex);
    const chosen = neighbors.length > 0
      ? neighbors[Math.floor(Math.random() * neighbors.length)]
      : getNeighbors(emptyIndex, size)[0];

    // Swap empty with chosen
    board[emptyIndex] = board[chosen];
    board[chosen] = total - 1;

    lastMovedIndex = emptyIndex;
    emptyIndex = chosen;
  }

  // Ensure it's not accidentally solved
  if (isBoardSolved(board)) {
    const neighbors = getNeighbors(emptyIndex, size);
    const chosen = neighbors[0];
    board[emptyIndex] = board[chosen];
    board[chosen] = total - 1;
  }

  return board;
}

/**
 * Checks if clicking on `clickedIndex` can move tiles into the empty space.
 * Supports direct adjacent clicks or multi-tile row/column slides.
 */
export function canMoveTile(
  board: number[],
  clickedIndex: number,
  size: number
): boolean {
  const emptyVal = size * size - 1;
  const emptyIndex = board.indexOf(emptyVal);
  if (clickedIndex === emptyIndex) return false;

  const cRow = Math.floor(clickedIndex / size);
  const cCol = clickedIndex % size;
  const eRow = Math.floor(emptyIndex / size);
  const eCol = emptyIndex % size;

  // Same row or same column
  return cRow === eRow || cCol === eCol;
}

/**
 * Executes a move on the board when `clickedIndex` is clicked.
 * Handles both single-step and row/col multi-tile pushing towards the empty slot.
 * Returns the new board array, or null if the move is invalid.
 */
export function executeMove(
  board: number[],
  clickedIndex: number,
  size: number
): number[] | null {
  const emptyVal = size * size - 1;
  const emptyIndex = board.indexOf(emptyVal);
  if (clickedIndex === emptyIndex) return null;

  const cRow = Math.floor(clickedIndex / size);
  const cCol = clickedIndex % size;
  const eRow = Math.floor(emptyIndex / size);
  const eCol = emptyIndex % size;

  const newBoard = [...board];

  // Moving along the same row
  if (cRow === eRow) {
    const step = cCol < eCol ? 1 : -1;
    // Shift elements towards the empty slot
    for (let col = eCol; col !== cCol; col -= step) {
      const fromIdx = cRow * size + (col - step);
      const toIdx = cRow * size + col;
      newBoard[toIdx] = newBoard[fromIdx];
    }
    newBoard[clickedIndex] = emptyVal;
    return newBoard;
  }

  // Moving along the same column
  if (cCol === eCol) {
    const step = cRow < eRow ? 1 : -1;
    // Shift elements towards the empty slot
    for (let row = eRow; row !== cRow; row -= step) {
      const fromIdx = (row - step) * size + cCol;
      const toIdx = row * size + cCol;
      newBoard[toIdx] = newBoard[fromIdx];
    }
    newBoard[clickedIndex] = emptyVal;
    return newBoard;
  }

  return null;
}

/**
 * Arrow key navigation: moves tile into the empty slot
 * Direction corresponds to which tile moves into the empty space:
 * - 'ArrowUp': Tile below moves UP into empty slot
 * - 'ArrowDown': Tile above moves DOWN into empty slot
 * - 'ArrowLeft': Tile to the right moves LEFT into empty slot
 * - 'ArrowRight': Tile to the left moves RIGHT into empty slot
 */
export function moveByDirection(
  board: number[],
  direction: 'up' | 'down' | 'left' | 'right',
  size: number
): number[] | null {
  const emptyVal = size * size - 1;
  const emptyIndex = board.indexOf(emptyVal);
  const eRow = Math.floor(emptyIndex / size);
  const eCol = emptyIndex % size;

  let targetIndex = -1;

  if (direction === 'up' && eRow < size - 1) {
    // Tile below slides up into empty space
    targetIndex = (eRow + 1) * size + eCol;
  } else if (direction === 'down' && eRow > 0) {
    // Tile above slides down into empty space
    targetIndex = (eRow - 1) * size + eCol;
  } else if (direction === 'left' && eCol < size - 1) {
    // Tile to the right slides left into empty space
    targetIndex = eRow * size + (eCol + 1);
  } else if (direction === 'right' && eCol > 0) {
    // Tile to the left slides right into empty space
    targetIndex = eRow * size + (eCol - 1);
  }

  if (targetIndex !== -1) {
    return executeMove(board, targetIndex, size);
  }
  return null;
}

/**
 * Calculate game score based on difficulty base, move count, and elapsed time.
 */
export function calculateScore(
  difficulty: Difficulty,
  moves: number,
  timeSeconds: number
): number {
  const config: DifficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const size = config.size;

  const moveCost = size === 3 ? 12 : size === 4 ? 8 : 5;
  const timeCost = size === 3 ? 6 : size === 4 ? 4 : 2;

  const penalty = moves * moveCost + timeSeconds * timeCost;
  const score = Math.max(100, Math.round(config.baseScore - penalty));

  // Add streak or speed bonus if completed swiftly
  const fastThreshold = size === 3 ? 45 : size === 4 ? 90 : 180;
  const bonus = timeSeconds < fastThreshold ? Math.round((fastThreshold - timeSeconds) * 10) : 0;

  return score + bonus;
}

/**
 * Format seconds into MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get count of tiles that are currently in their correct final position
 */
export function getCorrectTilesCount(board: number[]): number {
  let count = 0;
  const total = board.length;
  for (let i = 0; i < total; i++) {
    // We don't count the empty tile
    if (board[i] === i && board[i] !== total - 1) {
      count++;
    }
  }
  return count;
}
