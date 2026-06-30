import { areBoardsEqual } from "./board";
import type { BoardState } from "./types";

export const MAX_HISTORY_LENGTH = 50;

export interface BoardHistory {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
}

export function createHistory(present: BoardState): BoardHistory {
  return {
    past: [],
    present,
    future: []
  };
}

export function commitBoardChange(
  history: BoardHistory,
  next: BoardState,
  limit: number = MAX_HISTORY_LENGTH
): BoardHistory {
  if (areBoardsEqual(history.present, next)) {
    return history;
  }

  return {
    past: [...history.past, history.present].slice(-limit),
    present: next,
    future: []
  };
}

export function commitDraftChange(
  history: BoardHistory,
  strokeBase: BoardState,
  limit: number = MAX_HISTORY_LENGTH
): BoardHistory {
  if (areBoardsEqual(strokeBase, history.present)) {
    return history;
  }

  return {
    past: [...history.past, strokeBase].slice(-limit),
    present: history.present,
    future: []
  };
}

export function replacePresent(history: BoardHistory, present: BoardState): BoardHistory {
  if (history.present === present) {
    return history;
  }
  return {
    ...history,
    present
  };
}

export function undo(history: BoardHistory): BoardHistory {
  const previous = history.past.at(-1);
  if (!previous) {
    return history;
  }

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future]
  };
}

export function redo(history: BoardHistory): BoardHistory {
  const next = history.future[0];
  if (!next) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1)
  };
}

export function canUndo(history: BoardHistory): boolean {
  return history.past.length > 0;
}

export function canRedo(history: BoardHistory): boolean {
  return history.future.length > 0;
}
