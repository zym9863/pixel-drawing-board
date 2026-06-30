import { BOARD_SIZES, type BoardSize } from "../lib/types";

interface SizeSelectorProps {
  size: BoardSize;
  onSizeChange(size: BoardSize): void;
}

export function SizeSelector({ size, onSizeChange }: SizeSelectorProps) {
  return (
    <section className="panel-block" aria-label="画布尺寸">
      <div className="panel-title">尺寸</div>
      <div className="segmented-control">
        {BOARD_SIZES.map((option) => (
          <button
            key={option}
            type="button"
            className={option === size ? "is-selected" : ""}
            aria-pressed={option === size}
            data-testid={`size-${option}`}
            onClick={() => onSizeChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
