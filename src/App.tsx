import { useCallback, useEffect, useRef, useState } from "react";
import { ColorPalette } from "./components/ColorPalette";
import { PixelCanvas } from "./components/PixelCanvas";
import { SampleGallery } from "./components/SampleGallery";
import { SizeSelector } from "./components/SizeSelector";
import { StatusPanel } from "./components/StatusPanel";
import { ToastHost } from "./components/ToastHost";
import { Toolbar } from "./components/Toolbar";
import {
  applyToolAt,
  areBoardsEqual,
  clearBoard,
  createBoard,
  DEFAULT_COLOR,
  resizeBoard
} from "./lib/board";
import { downloadBoardAsPng } from "./lib/exportPng";
import {
  canRedo,
  canUndo,
  commitBoardChange,
  commitDraftChange,
  createHistory,
  redo,
  replacePresent,
  undo,
  type BoardHistory
} from "./lib/history";
import { readBoardFromStorage, writeBoardToStorage } from "./lib/storage";
import type { BoardSize, BoardState, ToastMessage, ToastTone, Tool } from "./lib/types";
import type { SampleBoard } from "./lib/sampleBoards";

function createInitialHistory(): BoardHistory {
  if (typeof window === "undefined") {
    return createHistory(createBoard());
  }

  return createHistory(readBoardFromStorage(window.localStorage) ?? createBoard());
}

export function App() {
  const [history, setHistory] = useState<BoardHistory>(() => createInitialHistory());
  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [exporting, setExporting] = useState(false);

  const strokeBaseRef = useRef<BoardState | null>(null);
  const drawingRef = useRef(false);
  const lastPixelRef = useRef<number | null>(null);
  const storageWarningShownRef = useRef(false);

  const board = history.present;

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((tone: ToastTone, text: string) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current.slice(-3), { id, tone, text }]);
    window.setTimeout(() => dismissToast(id), 2600);
  }, [dismissToast]);

  useEffect(() => {
    const stored = writeBoardToStorage(window.localStorage, board);
    if (!stored && !storageWarningShownRef.current) {
      storageWarningShownRef.current = true;
      showToast("error", "本地保存失败");
    }
  }, [board, showToast]);

  const finishStroke = useCallback(() => {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    lastPixelRef.current = null;
    const strokeBase = strokeBaseRef.current;
    strokeBaseRef.current = null;

    if (strokeBase) {
      setHistory((current) => commitDraftChange(current, strokeBase));
    }
  }, []);

  useEffect(() => {
    window.addEventListener("pointerup", finishStroke);
    window.addEventListener("pointercancel", finishStroke);
    return () => {
      window.removeEventListener("pointerup", finishStroke);
      window.removeEventListener("pointercancel", finishStroke);
    };
  }, [finishStroke]);

  const commitImmediate = useCallback((next: BoardState, message: string) => {
    setHistory((current) => commitBoardChange(current, next));
    if (!areBoardsEqual(board, next)) {
      showToast("success", message);
    }
  }, [board, showToast]);

  const applyDrawingPixel = useCallback((index: number) => {
    if (!drawingRef.current || lastPixelRef.current === index) {
      return;
    }

    lastPixelRef.current = index;
    setHistory((current) => replacePresent(current, applyToolAt(current.present, index, tool, color)));
  }, [color, tool]);

  const handlePixelDown = useCallback((index: number) => {
    try {
      if (tool === "fill") {
        commitImmediate(applyToolAt(board, index, tool, color), "已填充");
        return;
      }

      if (tool === "eyedropper") {
        const picked = board.pixels[index];
        if (picked) {
          setColor(picked);
          setTool("pencil");
          showToast("info", "已取色");
        } else {
          showToast("info", "空像素");
        }
        return;
      }

      drawingRef.current = true;
      strokeBaseRef.current = board;
      lastPixelRef.current = null;
      applyDrawingPixel(index);
    } catch {
      showToast("error", "绘制失败");
    }
  }, [applyDrawingPixel, board, color, commitImmediate, showToast, tool]);

  const handleSizeChange = useCallback((size: BoardSize) => {
    try {
      commitImmediate(resizeBoard(board, size), "尺寸已更新");
    } catch {
      showToast("error", "尺寸切换失败");
    }
  }, [board, commitImmediate, showToast]);

  const handleClear = useCallback(() => {
    try {
      commitImmediate(clearBoard(board), "画布已清空");
    } catch {
      showToast("error", "清空失败");
    }
  }, [board, commitImmediate, showToast]);

  const handleLoadSample = useCallback((sample: SampleBoard) => {
    commitImmediate(sample.board, "示例已载入");
  }, [commitImmediate]);

  const handleUndo = useCallback(() => {
    setHistory((current) => undo(current));
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((current) => redo(current));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      await downloadBoardAsPng(board);
      showToast("success", "PNG 已导出");
    } catch {
      showToast("error", "导出失败");
    } finally {
      setExporting(false);
    }
  }, [board, showToast]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">PIXEL STUDIO</p>
          <h1>像素绘画板</h1>
        </div>
        <StatusPanel board={board} tool={tool} color={color} />
      </header>

      <section className="workspace" aria-label="像素绘画工作台">
        <aside className="left-rail">
          <ColorPalette color={color} onColorChange={(nextColor) => {
            setColor(nextColor);
            if (tool === "eraser") {
              setTool("pencil");
            }
          }} />
          <Toolbar
            tool={tool}
            canUndo={canUndo(history)}
            canRedo={canRedo(history)}
            exporting={exporting}
            onToolChange={setTool}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onExport={handleExport}
          />
        </aside>

        <PixelCanvas
          board={board}
          onPixelDown={handlePixelDown}
          onPixelMove={applyDrawingPixel}
          onPointerEnd={finishStroke}
        />

        <aside className="right-rail">
          <SizeSelector size={board.size} onSizeChange={handleSizeChange} />
          <SampleGallery onLoadSample={handleLoadSample} />
        </aside>
      </section>

      <ToastHost messages={toasts} onDismiss={dismissToast} />
    </main>
  );
}
