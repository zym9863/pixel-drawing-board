import { restoreBoardState } from "./board";
import type { BoardState } from "./types";

export const STORAGE_KEY = "pixel-drawing-board:v1";

export interface BoardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readBoardFromStorage(storage: BoardStorage, key: string = STORAGE_KEY): BoardState | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }
    return restoreBoardState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeBoardToStorage(storage: BoardStorage, board: BoardState, key: string = STORAGE_KEY): boolean {
  try {
    storage.setItem(key, JSON.stringify(board));
    return true;
  } catch {
    return false;
  }
}
