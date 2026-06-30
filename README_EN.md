# Pixel Drawing Board

A React + TypeScript pixel drawing board with pencil, eraser, flood fill, eyedropper, undo/redo, canvas resizing, local autosave, sample artwork, and PNG export.

## How to Run

```bash
docker compose up
```

Open `http://localhost:8080` after the service starts.

## Service address (Services List)

| Service | Address | Description |
| --- | --- | --- |
| pixel-drawing-board | `http://localhost:8080` | Pixel drawing board web app |

## Verification method

```bash
bash run_tests.sh
```

The script installs dependencies, installs Playwright Chromium, runs unit tests with coverage, builds the production app, and runs API/browser workflow tests against the local preview service.
