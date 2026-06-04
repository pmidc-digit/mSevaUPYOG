#!/bin/sh
set -e

echo "[install-deps.sh] Starting dependency installation and build..."

INTERNALS="micro-ui-internals"

if [ ! -d "$INTERNALS" ]; then
  echo "❌ Error: $INTERNALS directory not found"
  exit 1
fi

# Build internal packages
echo "[install-deps.sh] Installing packages in $INTERNALS..."
cd "$INTERNALS"
yarn install || { echo "❌ yarn install failed in $INTERNALS"; exit 1; }

echo "[install-deps.sh] Building $INTERNALS packages..."
yarn build || { echo "❌ yarn build failed in $INTERNALS"; exit 1; }

echo "[install-deps.sh] Cleaning node_modules in $INTERNALS..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

cd ..

echo "[install-deps.sh] Cleaning root node_modules..."
rm -rf node_modules

# Note: yarn.lock is preserved to ensure reproducible builds

echo "[install-deps.sh] Installing root dependencies..."
yarn install || { echo "❌ yarn install failed at root"; exit 1; }

echo "[install-deps.sh] ✅ Dependency installation complete"
