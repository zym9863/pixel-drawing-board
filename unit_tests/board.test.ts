import { describe, expect, it } from "vitest";
import {
  applyToolAt,
  areBoardsEqual,
  clearBoard,
  countPaintedPixels,
  createBoard,
  fillRegion,
  getIndex,
  isBoardSize,
  normalizeColor,
  resizeBoard,
  restoreBoardState,
  setPixel,
  tryGetIndex
} from "../src/lib/board";

describe("board logic", () => {
  it("creates empty boards at supported sizes", () => {
    const board = createBoard(24);
    expect(board.size).toBe(24);
    expect(board.pixels).toHaveLength(576);
    expect(countPaintedPixels(board)).toBe(0);
    expect(isBoardSize(32)).toBe(true);
    expect(isBoardSize(12)).toBe(false);
  });

  it("normalizes hex colors and rejects invalid colors", () => {
    expect(normalizeColor("#ABC")).toBe("#aabbcc");
    expect(normalizeColor("#12abEF")).toBe("#12abef");
    expect(normalizeColor(null)).toBeNull();
    expect(() => normalizeColor("red")).toThrow(/format/);
    expect(() => normalizeColor(12 as never)).toThrow(/hex string/);
  });

  it("calculates pixel indexes and guards boundaries", () => {
    expect(getIndex(16, 2, 3)).toBe(35);
    expect(tryGetIndex(16, 15, 15)).toBe(255);
    expect(tryGetIndex(16, -1, 0)).toBeNull();
    expect(tryGetIndex(12 as never, 0, 0)).toBeNull();
    expect(() => getIndex(16, 16, 0)).toThrow(RangeError);
  });

  it("sets, erases, and ignores unchanged pixels", () => {
    const board = createBoard(16);
    const painted = setPixel(board, 0, "#ABC");
    expect(painted.pixels[0]).toBe("#aabbcc");
    expect(setPixel(painted, 0, "#aabbcc")).toBe(painted);
    expect(applyToolAt(painted, 0, "eraser", "#000000").pixels[0]).toBeNull();
    expect(() => setPixel(board, 999, "#000000")).toThrow(RangeError);
    expect(() => createBoard(12 as never)).toThrow(/16, 24, or 32/);
  });

  it("flood fills only connected pixels that match the target color", () => {
    let board = createBoard(16);
    board = setPixel(board, getIndex(16, 0, 1), "#000000");
    board = setPixel(board, getIndex(16, 1, 0), "#000000");
    board = setPixel(board, getIndex(16, 1, 1), "#000000");
    board = setPixel(board, getIndex(16, 5, 5), "#000000");

    const filled = fillRegion(board, 0, "#f2c94c");
    expect(filled.pixels[getIndex(16, 0, 0)]).toBe("#f2c94c");
    expect(filled.pixels[getIndex(16, 0, 2)]).toBe("#f2c94c");
    expect(filled.pixels[getIndex(16, 5, 5)]).toBe("#000000");
    expect(fillRegion(filled, 0, "#f2c94c")).toBe(filled);
    expect(() => fillRegion(filled, -1, "#ffffff")).toThrow(RangeError);
  });

  it("applies tool behavior consistently", () => {
    let board = createBoard(16);
    board = applyToolAt(board, 0, "pencil", "#e9542b");
    expect(board.pixels[0]).toBe("#e9542b");
    const filled = applyToolAt(board, 2, "fill", "#1f8f83");
    expect(filled.pixels[2]).toBe("#1f8f83");
    expect(applyToolAt(filled, 0, "eyedropper", "#ffffff")).toBe(filled);
    expect(() => applyToolAt(filled, 0, "spray" as never, "#ffffff")).toThrow(/Unsupported/);
  });

  it("clears boards and preserves top-left pixels when resizing", () => {
    let board = createBoard(16);
    board = setPixel(board, getIndex(16, 0, 0), "#e9542b");
    board = setPixel(board, getIndex(16, 15, 15), "#2e6fbb");

    const larger = resizeBoard(board, 24);
    expect(larger.size).toBe(24);
    expect(larger.pixels[getIndex(24, 0, 0)]).toBe("#e9542b");
    expect(larger.pixels[getIndex(24, 15, 15)]).toBe("#2e6fbb");

    const smaller = resizeBoard(larger, 16);
    expect(smaller.size).toBe(16);
    expect(resizeBoard(smaller, 16)).toBe(smaller);
    expect(clearBoard(smaller).pixels.every((pixel) => pixel === null)).toBe(true);
    expect(clearBoard(createBoard(16))).toEqual(createBoard(16));
  });

  it("restores valid stored state and rejects malformed state", () => {
    const restored = restoreBoardState({ size: 16, pixels: Array.from({ length: 256 }, () => "#FFF") });
    expect(restored?.pixels[0]).toBe("#ffffff");
    expect(restoreBoardState({ size: 12, pixels: [] })).toBeNull();
    expect(restoreBoardState({ size: 16, pixels: "bad" })).toBeNull();
    expect(restoreBoardState({ size: 16, pixels: ["nope"] })).toBeNull();
    expect(restoreBoardState({ size: 16, pixels: Array.from({ length: 256 }, () => "bad") })).toBeNull();
    expect(restoreBoardState({ size: 16, pixels: Array.from({ length: 256 }, () => undefined) })).toBeNull();
    expect(restoreBoardState(null)).toBeNull();
  });

  it("compares boards by size and pixel content", () => {
    const board = createBoard(16);
    const same = createBoard(16);
    const different = setPixel(board, 0, "#000000");
    expect(areBoardsEqual(board, same)).toBe(true);
    expect(areBoardsEqual(board, different)).toBe(false);
    expect(areBoardsEqual(board, createBoard(24))).toBe(false);
  });
});
