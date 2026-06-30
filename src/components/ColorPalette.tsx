interface PaletteColor {
  id: string;
  name: string;
  value: string;
}

export const presetColors: PaletteColor[] = [
  { id: "ink", name: "墨黑", value: "#2b2520" },
  { id: "paper", name: "纸白", value: "#f7f0de" },
  { id: "red", name: "朱红", value: "#e9542b" },
  { id: "gold", name: "琥珀", value: "#f2c94c" },
  { id: "green", name: "松绿", value: "#1f8f83" },
  { id: "blue", name: "海蓝", value: "#2e6fbb" },
  { id: "pink", name: "珊瑚", value: "#f08a91" },
  { id: "olive", name: "苔绿", value: "#7a8a51" }
];

interface ColorPaletteProps {
  color: string;
  onColorChange(color: string): void;
}

export function ColorPalette({ color, onColorChange }: ColorPaletteProps) {
  return (
    <section className="palette-panel" aria-label="颜色">
      <div className="panel-title">颜色</div>
      <div className="palette-grid">
        {presetColors.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`swatch ${color.toLowerCase() === item.value ? "is-selected" : ""}`}
            style={{ backgroundColor: item.value }}
            aria-label={item.name}
            title={item.name}
            data-testid={`palette-${item.id}`}
            onClick={() => onColorChange(item.value)}
          />
        ))}
      </div>
      <label className="color-input-shell" title="自定义颜色">
        <span className="color-input-preview" style={{ backgroundColor: color }} />
        <input
          type="color"
          aria-label="自定义颜色"
          value={color}
          data-testid="custom-color"
          onChange={(event) => onColorChange(event.target.value)}
        />
      </label>
    </section>
  );
}
