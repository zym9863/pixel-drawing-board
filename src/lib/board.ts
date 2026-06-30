import { BOARD_SIZES, type BoardSize, type BoardState, type PixelColor, type Tool } from "./types";

export const DEFAULT_BOARD_SIZE: BoardSize = 16;
export const DEFAULT_COLOR = "#2b2520";
export const EMPTY_PIXEL: PixelColor = null;

const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isBoardSize(size: unknown): size is BoardSize {
  return BOARD_SIZES.includes(size as BoardSize);
}

export function normalizeColor(color: PixelColor): PixelColor {
  if (color === null) {
    return null;
  }

  if (typeof color !== "string") {
    throw new Error("Color must be a hex string or null.");
  }

  const trimmed = color.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    throw new Error("Color must use #rgb or #rrggbb format.");
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed.toLowerCase();
    return `#${r}${r}${g}${g}${b}${b}`;
  }

  return trimmed.toLowerCase();
}

export function createBoard(size: BoardSize = DEFAULT_BOARD_SIZE, fill: PixelColor = EMPTY_PIXEL): BoardState {
  assertBoardSize(size);
  return {
    size,
    pixels: Array.from({ length: size * size }, () => normalizeColor(fill))
  };
}

export function restoreBoardState(value: unknown): BoardState | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<BoardState>;
  if (!isBoardSize(candidate.size) || !Array.isArray(candidate.pixels)) {
    return null;
  }

  if (candidate.pixels.length !== candidate.size * candidate.size) {
    return null;
  }

  try {
    return {
      size: candidate.size,
      pixels: candidate.pixels.map((pixel) => {
        if (pixel === null) {
          return null;
        }
        if (typeof pixel !== "string") {
          throw new Error("Invalid pixel color.");
        }
        return normalizeColor(pixel);
      })
    };
  } catch {
    return null;
  }
}

export function assertBoardState(board: BoardState): void {
  if (!restoreBoardState(board)) {
    throw new Error("Invalid board state.");
  }
}

export function getIndex(size: BoardSize, row: number, col: number): number {
  assertBoardSize(size);
  if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || col < 0 || row >= size || col >= size) {
    throw new RangeError("Pixel coordinates are outside the board.");
  }
  return row * size + col;
}

export function tryGetIndex(size: BoardSize, row: number, col: number): number | null {
  try {
    return getIndex(size, row, col);
  } catch {
    return null;
  }
}

export function setPixel(board: BoardState, index: number, color: PixelColor): BoardState {
  assertBoardState(board);
  assertPixelIndex(board, index);

  const nextColor = normalizeColor(color);
  if (board.pixels[index] === nextColor) {
    return board;
  }

  const pixels = [...board.pixels];
  pixels[index] = nextColor;
  return { ...board, pixels };
}

export function applyToolAt(board: BoardState, index: number, tool: Tool, color: string): BoardState {
  switch (tool) {
    case "pencil":
      return setPixel(board, index, color);
    case "eraser":
      return setPixel(board, index, EMPTY_PIXEL);
    case "fill":
      return fillRegion(board, index, color);
    case "eyedropper":
      return board;
    default:
      return exhaustiveToolCheck(tool);
  }
}

export function fillRegion(board: BoardState, startIndex: number, replacement: PixelColor): BoardState {
  assertBoardState(board);
  assertPixelIndex(board, startIndex);

  const replacementColor = normalizeColor(replacement);
  const targetColor = board.pixels[startIndex];
  if (targetColor === replacementColor) {
    return board;
  }

  const pixels = [...board.pixels];
  const visited = new Set<number>();
  const stack = [startIndex];

  while (stack.length > 0) {
    const index = stack.pop();
    if (index === undefined || visited.has(index) || pixels[index] !== targetColor) {
      continue;
    }

    visited.add(index);
    pixels[index] = replacementColor;

    const row = Math.floor(index / board.size);
    const col = index % board.size;
    const neighbors = [
      tryGetIndex(board.size, row - 1, col),
      tryGetIndex(board.size, row + 1, col),
      tryGetIndex(board.size, row, col - 1),
      tryGetIndex(board.size, row, col + 1)
    ];

    for (const neighbor of neighbors) {
      if (neighbor !== null && !visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return { ...board, pixels };
}

export function clearBoard(board: BoardState): BoardState {
  assertBoardState(board);
  if (board.pixels.every((pixel) => pixel === EMPTY_PIXEL)) {
    return board;
  }
  return createBoard(board.size);
}

export function resizeBoard(board: BoardState, nextSize: BoardSize): BoardState {
  assertBoardState(board);
  assertBoardSize(nextSize);

  if (board.size === nextSize) {
    return board;
  }

  const next = createBoard(nextSize);
  const sharedSize = Math.min(board.size, nextSize);

  for (let row = 0; row < sharedSize; row += 1) {
    for (let col = 0; col < sharedSize; col += 1) {
      const oldIndex = getIndex(board.size, row, col);
      const nextIndex = getIndex(nextSize, row, col);
      next.pixels[nextIndex] = board.pixels[oldIndex];
    }
  }

  return next;
}

export function countPaintedPixels(board: BoardState): number {
  assertBoardState(board);
  return board.pixels.filter((pixel) => pixel !== EMPTY_PIXEL).length;
}

export function areBoardsEqual(left: BoardState, right: BoardState): boolean {
  if (left.size !== right.size || left.pixels.length !== right.pixels.length) {
    return false;
  }
  return left.pixels.every((pixel, index) => pixel === right.pixels[index]);
}

function assertBoardSize(size: unknown): asserts size is BoardSize {
  if (!isBoardSize(size)) {
    throw new Error("Board size must be 16, 24, or 32.");
  }
}

function assertPixelIndex(board: BoardState, index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= board.pixels.length) {
    throw new RangeError("Pixel index is outside the board.");
  }
}

function exhaustiveToolCheck(tool: never): never {
  throw new Error(`Unsupported tool: ${tool}`);
}
