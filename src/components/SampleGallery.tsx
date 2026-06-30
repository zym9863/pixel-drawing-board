import { sampleBoards, type SampleBoard } from "../lib/sampleBoards";
import type { CSSProperties } from "react";

interface SampleGalleryProps {
  onLoadSample(sample: SampleBoard): void;
}

export function SampleGallery({ onLoadSample }: SampleGalleryProps) {
  return (
    <section className="panel-block" aria-label="示例作品">
      <div className="panel-title">示例</div>
      <div className="sample-list">
        {sampleBoards.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="sample-tile"
            data-testid={`sample-${sample.id}`}
            onClick={() => onLoadSample(sample)}
          >
            <span className="sample-preview" style={{ "--sample-size": sample.board.size } as CSSProperties}>
              {sample.board.pixels.map((pixel, index) => (
                <span key={index} style={{ backgroundColor: pixel ?? "transparent" }} />
              ))}
            </span>
            <span>{sample.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
