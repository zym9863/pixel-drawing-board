import { createBoard, getIndex, normalizeColor } from "./board";
import type { BoardState, PixelColor } from "./types";

export interface SampleBoard {
  id: string;
  name: string;
  board: BoardState;
}

type PatternPalette = Record<string, PixelColor>;

const palette: PatternPalette = {
  ".": null,
  K: "#2b2520",
  C: "#1f8f83",
  B: "#2e6fbb",
  R: "#e9542b",
  Y: "#f2c94c",
  P: "#f08a91",
  W: "#f7f0de",
  G: "#7a8a51"
};

export function boardFromPattern(rows: string[], colors: PatternPalette = palette): BoardState {
  const size = rows.length;
  if (![16, 24, 32].includes(size) || rows.some((row) => row.length !== size)) {
    throw new Error("Pattern must be a square 16, 24, or 32 grid.");
  }

  const board = createBoard(size as BoardState["size"]);
  rows.forEach((row, rowIndex) => {
    [...row].forEach((token, colIndex) => {
      if (!(token in colors)) {
        throw new Error(`Unknown pattern token: ${token}`);
      }
      board.pixels[getIndex(board.size, rowIndex, colIndex)] = normalizeColor(colors[token]);
    });
  });

  return board;
}

export const sampleBoards: SampleBoard[] = [
  {
    id: "harbor",
    name: "港口日落",
    board: boardFromPattern([
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBBBBBBBBBBB",
      "BBBBBBYYYYBBBBBB",
      "BBBBBYYYYYYBBBBB",
      "BBBBBBYYYYBBBBBB",
      "CCCCCCCCCCCCCCCC",
      "CCCCCCCCCCCCCCCC",
      "GGGGGGGGGGGGGGGG",
      "GGGKKGGGGGGKKGGG",
      "GGKKKKGGGGKKKKGG",
      "GGGKKGGGGGGKKGGG",
      "GGGGGGGRRGGGGGGG",
      "GGGGGGRRRRGGGGGG",
      "GGGGGRRRRRRGGGGG",
      "KKKKKKKKKKKKKKKK"
    ])
  },
  {
    id: "workbench",
    name: "工作台",
    board: boardFromPattern([
      "................",
      "....KKKKKKKK....",
      "...KWWWWWWWWK...",
      "..KWCCWCCWCCWK..",
      "..KWCCWCCWCCWK..",
      "..KWWWWWWWWWWK..",
      "...KKKKKKKKKK...",
      "......KRRK......",
      "....KKKRRKKK....",
      "...KYYYYYYYYK...",
      "...KYYYYYYYYK...",
      "....KKKKKKKK....",
      "......K..K......",
      ".....KK..KK.....",
      "....KK....KK....",
      "................"
    ])
  }
];
