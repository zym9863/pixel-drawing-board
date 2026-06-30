import { describe, expect, it } from "vitest";
import { createBoard, setPixel } from "../src/lib/board";
import {
  canRedo,
  canUndo,
  commitBoardChange,
  commitDraftChange,
  createHistory,
  redo,
  replacePresent,
  undo
} from "../src/lib/history";

describe("board history", () => {
  it("commits changes and skips identical boards", () => {
    const initial = createBoard(16);
    const history = createHistory(initial);
    const unchanged = commitBoardChange(history, createBoard(16));
    expect(unchanged).toBe(history);

    const changed = commitBoardChange(history, setPixel(initial, 0, "#000000"));
    expect(changed.past).toHaveLength(1);
    expect(changed.future).toHaveLength(0);
    expect(canUndo(changed)).toBe(true);
  });

  it("commits a drag stroke as one undo step", () => {
    const initial = createBoard(16);
    let history = createHistory(initial);
    history = replacePresent(history, setPixel(history.present, 0, "#000000"));
    history = replacePresent(history, setPixel(history.present, 1, "#000000"));
    history = commitDraftChange(history, initial);

    expect(history.past).toHaveLength(1);
    expect(history.present.pixels[0]).toBe("#000000");
    expect(undo(history).present).toBe(initial);
  });

  it("supports undo and redo", () => {
    const initial = createBoard(16);
    const changed = setPixel(initial, 0, "#000000");
    const history = commitBoardChange(createHistory(initial), changed);

    const undone = undo(history);
    expect(undone.present).toBe(initial);
    expect(canRedo(undone)).toBe(true);

    const redone = redo(undone);
    expect(redone.present).toBe(changed);
    expect(canRedo(redone)).toBe(false);
  });

  it("no-ops when undo, redo, or draft commit has no work", () => {
    const history = createHistory(createBoard(16));
    expect(undo(history)).toBe(history);
    expect(redo(history)).toBe(history);
    expect(commitDraftChange(history, history.present)).toBe(history);
  });
});
