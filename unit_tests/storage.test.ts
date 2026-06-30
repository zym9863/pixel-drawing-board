import { describe, expect, it } from "vitest";
import { createBoard, setPixel } from "../src/lib/board";
import { readBoardFromStorage, STORAGE_KEY, writeBoardToStorage, type BoardStorage } from "../src/lib/storage";

function createMemoryStorage(): BoardStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    }
  };
}

describe("board storage", () => {
  it("writes and reads board state", () => {
    const storage = createMemoryStorage();
    const board = setPixel(createBoard(16), 0, "#e9542b");

    expect(writeBoardToStorage(storage, board)).toBe(true);
    expect(storage.data.has(STORAGE_KEY)).toBe(true);
    expect(readBoardFromStorage(storage)).toEqual(board);
  });

  it("returns null for missing, invalid, or malformed JSON data", () => {
    const storage = createMemoryStorage();
    expect(readBoardFromStorage(storage)).toBeNull();

    storage.data.set(STORAGE_KEY, "{");
    expect(readBoardFromStorage(storage)).toBeNull();

    storage.data.set(STORAGE_KEY, JSON.stringify({ size: 16, pixels: ["bad"] }));
    expect(readBoardFromStorage(storage)).toBeNull();

    const throwingStorage: BoardStorage = {
      getItem: () => {
        throw new Error("locked");
      },
      setItem: () => undefined
    };
    expect(readBoardFromStorage(throwingStorage)).toBeNull();
  });

  it("reports storage write failures", () => {
    const failingStorage: BoardStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      }
    };

    expect(writeBoardToStorage(failingStorage, createBoard(16))).toBe(false);
  });
});
