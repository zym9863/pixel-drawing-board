#!/usr/bin/env bash
set -euo pipefail

echo "== Pixel Drawing Board: dependency installation =="
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "== Pixel Drawing Board: Playwright browser installation =="
npx playwright install chromium

echo "== Pixel Drawing Board: unit tests and coverage =="
npm run test:unit

echo "== Pixel Drawing Board: production build =="
npm run build

echo "== Pixel Drawing Board: API and browser workflow tests =="
npm run test:api

echo "== Summary =="
echo "All test suites passed: unit tests, production build, API/browser tests."
