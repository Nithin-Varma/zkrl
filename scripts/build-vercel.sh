#!/bin/bash

# Vercel build script that installs Foundry, compiles contracts, and builds the web app

set -e  # Exit on error

echo "🔧 Installing Foundry..."
# Install foundryup
curl -L https://foundry.paradigm.xyz | bash

# Add foundry to PATH for this session
export PATH="$HOME/.foundry/bin:$PATH"

# Install forge, cast, anvil, and chisel
foundryup

echo "✅ Foundry installed successfully"
echo "📦 Running contract compilation and web build..."

# Run the existing build script
bash scripts/copy-contracts.sh

echo "🏗️  Building Next.js app..."
pnpm --filter web build

echo "✅ Build completed successfully!"
