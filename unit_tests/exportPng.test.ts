import { describe, expect, it, vi } from "vitest";
import { createBoard, setPixel } from "../src/lib/board";
import {
  createExportFileName,
  DEFAULT_EXPORT_SCALE,
  downloadBoardAsPng,
  getExportDimensions,
  renderBoardToCanvas
} from "../src/lib/exportPng";

describe("PNG export helpers", () => {
  it("calculates export dimensions", () => {
    const board = createBoard(16);
    expect(getExportDimensions(board)).toEqual({
      width: 16 * DEFAULT_EXPORT_SCALE,
      height: 16 * DEFAULT_EXPORT_SCALE
    });
    expect(getExportDimensions(board, 2)).toEqual({ width: 32, height: 32 });
    expect(() => getExportDimensions(board, 0)).toThrow(/scale/);
  });

  it("creates stable export file names", () => {
    expect(createExportFileName(new Date("2026-06-30T00:00:00.000Z"))).toBe(
      "pixel-board-2026-06-30T00-00-00-000Z.png"
    );
  });

  it("renders board pixels to a canvas context", () => {
    const fillRect = vi.fn();
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        imageSmoothingEnabled: true,
        fillStyle: "",
        fillRect
      })
    } as unknown as HTMLCanvasElement;

    const board = setPixel(createBoard(16), 0, "#e9542b");
    renderBoardToCanvas(canvas, board, 4);

    expect(canvas.width).toBe(64);
    expect(canvas.height).toBe(64);
    expect(fillRect).toHaveBeenCalledWith(0, 0, 64, 64);
    expect(fillRect).toHaveBeenCalledWith(0, 0, 4, 4);
  });

  it("throws when the canvas context is unavailable", () => {
    const canvas = { getContext: () => null } as unknown as HTMLCanvasElement;
    expect(() => renderBoardToCanvas(canvas, createBoard(16))).toThrow(/context/);
  });

  it("downloads a rendered PNG file", async () => {
    const fillRect = vi.fn();
    const link = { href: "", download: "", click: vi.fn() };
    const canvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        imageSmoothingEnabled: true,
        fillStyle: "",
        fillRect
      }),
      toBlob: (callback: (blob: Blob | null) => void) => callback(new Blob(["png"], { type: "image/png" }))
    };
    const revokeObjectURL = vi.fn();

    vi.stubGlobal("document", {
      createElement: (tag: string) => (tag === "canvas" ? canvas : link)
    });
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:pixel",
      revokeObjectURL
    });
    vi.stubGlobal("window", {
      setTimeout: (callback: () => void) => {
        callback();
        return 1;
      }
    });

    await downloadBoardAsPng(setPixel(createBoard(16), 0, "#e9542b"), "pixel.png");

    expect(link.href).toBe("blob:pixel");
    expect(link.download).toBe("pixel.png");
    expect(link.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:pixel");
    vi.unstubAllGlobals();
  });
});
