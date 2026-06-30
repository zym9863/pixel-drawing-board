import type { CSSProperties, PointerEvent } from "react";
import type { BoardState } from "../lib/types";

interface PixelCanvasProps {
  board: BoardState;
  onPixelDown(index: number): void;
  onPixelMove(index: number): void;
  onPointerEnd(): void;
}

export function PixelCanvas({ board, onPixelDown, onPixelMove, onPointerEnd }: PixelCanvasProps) {
  function readPixelIndex(event: PointerEvent<HTMLDivElement>): number | null {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const pixel = target?.closest<HTMLElement>("[data-pixel-index]");
    if (!pixel) {
      return null;
    }
    return Number(pixel.dataset.pixelIndex);
  }

  return (
    <div className="canvas-stage" aria-label="像素画布">
      <div
        className="pixel-grid"
        style={{ "--board-size": board.size } as CSSProperties}
        data-testid="pixel-grid"
        onPointerMove={(event) => {
          const index = readPixelIndex(event);
          if (index !== null) {
            onPixelMove(index);
          }
        }}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        {board.pixels.map((pixel, index) => {
          const row = Math.floor(index / board.size) + 1;
          const col = (index % board.size) + 1;
          return (
            <button
              key={index}
              type="button"
              className="pixel-cell"
              aria-label={`像素 ${row},${col}`}
              data-testid={`pixel-${index}`}
              data-pixel-index={index}
              data-color={pixel ?? ""}
              style={{ backgroundColor: pixel ?? "transparent" }}
              onPointerDown={(event) => {
                event.preventDefault();
                onPixelDown(index);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
