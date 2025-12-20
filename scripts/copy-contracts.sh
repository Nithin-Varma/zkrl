#!/bin/bash

# Script to compile contracts and copy JSON files to the web package
# This runs before the Next.js build to ensure contract ABIs are available

set -e  # Exit on error

echo "📦 Compiling smart contracts..."
cd packages/contracts

# Compile contracts with forge
forge build

cd ../..

echo "📋 Copying contract ABIs..."
# Create contracts directory if it doesn't exist
mkdir -p packages/web/src/contracts

# Copy contract JSON files from contracts package
CONTRACTS_DIR="packages/contracts/out"

if [ -f "$CONTRACTS_DIR/IdentityRegister.sol/IdentityRegistry.json" ]; then
  cp "$CONTRACTS_DIR/IdentityRegister.sol/IdentityRegistry.json" packages/web/src/contracts/
fi

if [ -f "$CONTRACTS_DIR/UserFactory.sol/UserFactory.json" ]; then
  cp "$CONTRACTS_DIR/UserFactory.sol/UserFactory.json" packages/web/src/contracts/
fi

if [ -f "$CONTRACTS_DIR/BondFactory.sol/BondFactory.json" ]; then
  cp "$CONTRACTS_DIR/BondFactory.sol/BondFactory.json" packages/web/src/contracts/
fi

if [ -f "$CONTRACTS_DIR/User.sol/User.json" ]; then
  cp "$CONTRACTS_DIR/User.sol/User.json" packages/web/src/contracts/
fi

if [ -f "$CONTRACTS_DIR/Bond.sol/Bond.json" ]; then
  cp "$CONTRACTS_DIR/Bond.sol/Bond.json" packages/web/src/contracts/
fi

echo "Contract files copied successfully"
