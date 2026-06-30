export const BOARD_SIZES = [16, 24, 32] as const;

export type BoardSize = (typeof BOARD_SIZES)[number];
export type PixelColor = string | null;
export type Tool = "pencil" | "eraser" | "fill" | "eyedropper";
export type ToastTone = "success" | "error" | "info";

export interface BoardState {
  size: BoardSize;
  pixels: PixelColor[];
}

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  text: string;
}
