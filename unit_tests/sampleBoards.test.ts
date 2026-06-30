import { describe, expect, it } from "vitest";
import { countPaintedPixels } from "../src/lib/board";
import { boardFromPattern, sampleBoards } from "../src/lib/sampleBoards";

describe("sample boards", () => {
  it("provides loadable sample artwork", () => {
    expect(sampleBoards.length).toBeGreaterThanOrEqual(2);
    for (const sample of sampleBoards) {
      expect(sample.board.size).toBe(16);
      expect(sample.board.pixels).toHaveLength(256);
      expect(countPaintedPixels(sample.board)).toBeGreaterThan(20);
    }
  });

  it("rejects malformed patterns", () => {
    const unknownTokenRows = Array.from({ length: 16 }, () => "................");
    unknownTokenRows[0] = "...............X";

    expect(() => boardFromPattern(["..", ".."])).toThrow(/square/);
    expect(() => boardFromPattern(unknownTokenRows)).toThrow(/Unknown/);
  });
});
