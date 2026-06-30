# 像素绘画板

一个完整的 React + TypeScript 像素绘画板，支持绘制、擦除、油漆桶填充、吸管取色、撤销/重做、画布尺寸切换、本地自动保存、示例作品和 PNG 导出。

## How to Run

```bash
docker compose up
```

启动后打开浏览器访问 `http://localhost:8080`。

## Service address (Services List)

| Service | Address | Description |
| --- | --- | --- |
| pixel-drawing-board | `http://localhost:8080` | 像素绘画板 Web 应用 |

## Verification method

```bash
bash run_tests.sh
```

脚本会安装依赖、安装 Playwright Chromium、运行单元测试和覆盖率检查、执行生产构建，并启动本地预览服务完成 API/浏览器工作流测试。单元测试覆盖核心绘画逻辑、历史记录、存储校验、导出辅助和示例作品；API 测试覆盖 `GET /` 以及主要绘画流程。

## Development

```bash
npm install
npm run dev -- --host 0.0.0.0
```

开发服务默认运行在 `http://localhost:5173`。
