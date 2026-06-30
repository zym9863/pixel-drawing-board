import { countPaintedPixels } from "../lib/board";
import type { BoardState, Tool } from "../lib/types";

interface StatusPanelProps {
  board: BoardState;
  tool: Tool;
  color: string;
}

const toolNames: Record<Tool, string> = {
  pencil: "铅笔",
  eraser: "橡皮擦",
  fill: "油漆桶",
  eyedropper: "吸管"
};

export function StatusPanel({ board, tool, color }: StatusPanelProps) {
  return (
    <section className="status-panel" aria-label="状态">
      <div>
        <span>工具</span>
        <strong data-testid="current-tool">{toolNames[tool]}</strong>
      </div>
      <div>
        <span>像素</span>
        <strong data-testid="painted-count">{countPaintedPixels(board)}</strong>
      </div>
      <div>
        <span>色值</span>
        <strong data-testid="current-color">{color}</strong>
      </div>
    </section>
  );
}
