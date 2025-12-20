#!/bin/bash

# Create contracts directory if it doesn't exist
mkdir -p src/contracts

# Copy contract JSON files from contracts package
CONTRACTS_DIR="../../contracts/out"

if [ -f "$CONTRACTS_DIR/IdentityRegister.sol/IdentityRegistry.json" ]; then
  cp "$CONTRACTS_DIR/IdentityRegister.sol/IdentityRegistry.json" src/contracts/
fi

if [ -f "$CONTRACTS_DIR/UserFactory.sol/UserFactory.json" ]; then
  cp "$CONTRACTS_DIR/UserFactory.sol/UserFactory.json" src/contracts/
fi

if [ -f "$CONTRACTS_DIR/BondFactory.sol/BondFactory.json" ]; then
  cp "$CONTRACTS_DIR/BondFactory.sol/BondFactory.json" src/contracts/
fi

if [ -f "$CONTRACTS_DIR/User.sol/User.json" ]; then
  cp "$CONTRACTS_DIR/User.sol/User.json" src/contracts/
fi

if [ -f "$CONTRACTS_DIR/Bond.sol/Bond.json" ]; then
  cp "$CONTRACTS_DIR/Bond.sol/Bond.json" src/contracts/
fi

echo "Contract files copied successfully"
