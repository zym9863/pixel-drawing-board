import { assertBoardState } from "./board";
import type { BoardState } from "./types";

export const DEFAULT_EXPORT_SCALE = 28;
export const DEFAULT_EXPORT_BACKGROUND = "#ffffff";

export interface ExportDimensions {
  width: number;
  height: number;
}

export function getExportDimensions(board: BoardState, scale: number = DEFAULT_EXPORT_SCALE): ExportDimensions {
  assertBoardState(board);
  assertScale(scale);
  return {
    width: board.size * scale,
    height: board.size * scale
  };
}

export function createExportFileName(date: Date = new Date()): string {
  const stamp = date.toISOString().replace(/[:.]/g, "-");
  return `pixel-board-${stamp}.png`;
}

export function renderBoardToCanvas(
  canvas: HTMLCanvasElement,
  board: BoardState,
  scale: number = DEFAULT_EXPORT_SCALE,
  emptyColor: string = DEFAULT_EXPORT_BACKGROUND
): void {
  assertBoardState(board);
  assertScale(scale);

  const dimensions = getExportDimensions(board, scale);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas rendering context is unavailable.");
  }

  context.imageSmoothingEnabled = false;
  context.fillStyle = emptyColor;
  context.fillRect(0, 0, dimensions.width, dimensions.height);

  board.pixels.forEach((pixel, index) => {
    if (!pixel) {
      return;
    }

    const row = Math.floor(index / board.size);
    const col = index % board.size;
    context.fillStyle = pixel;
    context.fillRect(col * scale, row * scale, scale, scale);
  });
}

export async function downloadBoardAsPng(
  board: BoardState,
  filename: string = createExportFileName()
): Promise<void> {
  const canvas = document.createElement("canvas");
  renderBoardToCanvas(canvas, board);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error("PNG export failed."));
        return;
      }
      resolve(result);
    }, "image/png");
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function assertScale(scale: number): void {
  if (!Number.isInteger(scale) || scale < 1 || scale > 96) {
    throw new Error("Export scale must be an integer from 1 to 96.");
  }
}
