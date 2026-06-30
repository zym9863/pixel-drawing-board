import { Download, Eraser, PaintBucket, Pencil, Pipette, Redo2, Trash2, Undo2 } from "lucide-react";
import { IconButton } from "./IconButton";
import type { Tool } from "../lib/types";

interface ToolbarProps {
  tool: Tool;
  canUndo: boolean;
  canRedo: boolean;
  exporting: boolean;
  onToolChange(tool: Tool): void;
  onUndo(): void;
  onRedo(): void;
  onClear(): void;
  onExport(): void;
}

export function Toolbar({
  tool,
  canUndo,
  canRedo,
  exporting,
  onToolChange,
  onUndo,
  onRedo,
  onClear,
  onExport
}: ToolbarProps) {
  return (
    <div className="toolbar" aria-label="绘画工具">
      <div className="tool-group">
        <IconButton
          label="铅笔"
          icon={<Pencil size={20} />}
          active={tool === "pencil"}
          aria-pressed={tool === "pencil"}
          data-testid="tool-pencil"
          onClick={() => onToolChange("pencil")}
        />
        <IconButton
          label="橡皮擦"
          icon={<Eraser size={20} />}
          active={tool === "eraser"}
          aria-pressed={tool === "eraser"}
          data-testid="tool-eraser"
          onClick={() => onToolChange("eraser")}
        />
        <IconButton
          label="油漆桶"
          icon={<PaintBucket size={20} />}
          active={tool === "fill"}
          aria-pressed={tool === "fill"}
          data-testid="tool-fill"
          onClick={() => onToolChange("fill")}
        />
        <IconButton
          label="吸管"
          icon={<Pipette size={20} />}
          active={tool === "eyedropper"}
          aria-pressed={tool === "eyedropper"}
          data-testid="tool-eyedropper"
          onClick={() => onToolChange("eyedropper")}
        />
      </div>

      <div className="tool-group">
        <IconButton
          label="撤销"
          icon={<Undo2 size={20} />}
          disabled={!canUndo}
          data-testid="undo-button"
          onClick={onUndo}
        />
        <IconButton
          label="重做"
          icon={<Redo2 size={20} />}
          disabled={!canRedo}
          data-testid="redo-button"
          onClick={onRedo}
        />
      </div>

      <div className="tool-group">
        <IconButton
          label="导出 PNG"
          icon={<Download size={20} />}
          disabled={exporting}
          data-testid="export-button"
          onClick={onExport}
        />
        <IconButton
          label="清空画布"
          icon={<Trash2 size={20} />}
          tone="danger"
          data-testid="clear-button"
          onClick={onClear}
        />
      </div>
    </div>
  );
}
