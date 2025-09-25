# zkRL: Reputation-Based Undercollateralized Lending Protocol

A decentralized lending protocol that enables undercollateralized loans through reputation-based trust networks, leveraging zero-knowledge proofs for privacy-preserving identity verification and collateral proof generation.

## 🎯 Problem Statement

Traditional DeFi lending requires over-collateralization (150-200% collateral ratios), locking up excessive capital and limiting borrowing capacity. zkRL solves this by leveraging reputation-based trust networks where users build creditworthiness through peer interactions, enabling undercollateralized loans (80-100% collateral ratios) while maintaining security through zero-knowledge proof verification of trust relationships.

**Key Technical Challenges:**
- Proof aggregation time on zk-verify relayers
- Generating privacy-preserving proofs to verify bond amounts without revealing sensitive financial information

## 🏗️ Architecture Overview

### Smart Contract Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   zk-verify     │    │   Horizon       │    │   Frontend      │
│   Relayer       │    │   Blockchain    │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Smart Contract Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  IdentityRegistry  │  UserFactory  │  BondFactory  │ LenderFactory │
├─────────────────────────────────────────────────────────────────┤
│     User Contract     │     Bond Contract     │  Lender Contract  │
└─────────────────────────────────────────────────────────────────┘
```

### Core Smart Contracts

#### 1. **IdentityRegistry**
- **Purpose**: Stores verified Aadhaar identities using zk-verify proofs
- **Key Functions**:
  - `verifyAadhar()`: Verifies Aadhaar identity with zk-proofs
  - `checkVerified()`: Checks if a wallet is verified
- **zk-verify Integration**: Receives aggregated proofs from zk-verify relayer

#### 2. **UserFactory**
- **Purpose**: Deploys individual User contracts for each verified user
- **Key Functions**:
  - `createUser()`: Creates User contract for verified identity
  - `hasUserContract()`: Checks if user has a contract
  - `getUserContract()`: Retrieves user's contract address

#### 3. **User Contract**
- **Purpose**: Manages user's bonds, trust score, and reputation data
- **Key Functions**:
  - `createBond()`: Creates bonds with other users
  - `addBond()`: Adds bond to user's bond list
  - `updateStakeDetails()`: Updates staking information
  - `updateWithdrawnDetails()`: Tracks withdrawal history
  - `updateBreakDetails()`: Manages bond breaking

#### 4. **BondFactory**
- **Purpose**: Creates bond contracts between users
- **Key Functions**:
  - `createBond()`: Deploys new bond contract
  - `getBond()`: Retrieves bond contract address

#### 5. **Bond Contract**
- **Purpose**: Individual bond with staking, withdrawal, and breaking logic
- **Key Functions**:
  - `stake()`: Allows users to stake funds in bond
  - `withdraw()`: Enables fund withdrawal
  - `breakBond()`: Breaks the bond and distributes funds
- **State Management**: Tracks bond status, amounts, and user relationships

#### 6. **LenderFactory**
- **Purpose**: Deploys individual Lender contracts
- **Key Functions**:
  - `createLender()`: Creates lender contract with interest rate
  - `getLender()`: Retrieves lender contract address
  - `hasLender()`: Checks if lender exists

#### 7. **Lender Contract**
- **Purpose**: Manages lender's funds, interest rates, and loan processing
- **Key Functions**:
  - `addFunds()`: Allows lender to add funds
  - `setInterestRate()`: Sets/updates interest rate
  - `verifyAndLend()`: Processes loan with collateral verification
  - `withdrawFunds()`: Enables fund withdrawal

## 🔐 Zero-Knowledge Proof Integration

### zk-verify Relayer Integration

The protocol leverages zk-verify for two critical proof operations:

#### 1. **Identity Verification**
```solidity
function verifyAadhar(
    address wallet,
    bytes32 identityHash,
    bytes32 _leaf,
    uint256 _aggregationId,
    uint256 _domainId,
    bytes32[] calldata _merklePath,
    uint256 _leafCount,
    uint256 _index
) external {
    // Verifies Aadhaar identity using zk-verify aggregated proof
    // Stores verified identity without revealing personal data
}
```

#### 2. **Collateral Proof Generation**
- **Purpose**: Prove bond collateral adequacy without revealing amounts
- **Process**: Generate zk-proofs that verify bond values meet loan requirements
- **Privacy**: Lenders can verify collateral without accessing sensitive financial data

### Proof Aggregation Process

1. **User generates proof** for Aadhaar identity or bond collateral
2. **zk-verify relayer** aggregates multiple proofs
3. **Aggregated proof** submitted to smart contracts
4. **Smart contracts verify** proof without revealing underlying data

## 🔄 User Flow

### 1. **Identity Onboarding**
```
User → zk-verify (Aadhaar Proof) → IdentityRegistry → UserFactory → User Contract
```

### 2. **Bond Creation**
```
User A + User B → BondFactory → Bond Contract → Stake Funds → Active Bond
```

### 3. **Lender Onboarding**
```
Lender → LenderFactory → Lender Contract → Add Funds → Set Interest Rate
```

### 4. **Loan Request Process**
```
Borrower → Select Bonds → Generate Collateral Proof → Request Loan → Lender Dashboard
```

### 5. **Loan Approval**
```
Lender → Verify Collateral Proof → Approve Loan → Transfer Funds → Bond Ownership Transfer
```

## 🛠️ Technical Implementation

### Frontend Architecture
- **Framework**: Next.js with TypeScript
- **Blockchain Integration**: Wagmi + Viem
- **UI Components**: Custom React components with Tailwind CSS
- **State Management**: React hooks for contract interactions

### Smart Contract Development
- **Framework**: Foundry (Forge)
- **Language**: Solidity
- **Testing**: Forge test suite
- **Deployment**: Foundry scripts on Horizon

### Key Features
- **Real-time Bond Amount Display**: Fetches actual bond amounts from smart contracts
- **Privacy-Preserving Verification**: zk-proofs for identity and collateral
- **Dynamic Trust Scoring**: Game theory-based reputation calculation
- **Request-Based Lending**: Off-chain loan requests with on-chain execution

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Foundry
- Horizon wallet

### Installation
```bash
# Install dependencies
pnpm install

# Compile smart contracts
cd packages/contracts
forge build

# Deploy contracts
forge script script/IdentityRegistry.s.sol --rpc-url horizon --broadcast

# Start frontend
cd packages/web
npm run dev
```

### Environment Setup
```bash
# Copy environment template
cp packages/web/.env.example packages/web/.env.local

# Add contract addresses
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_USER_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_BOND_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_LENDER_FACTORY_ADDRESS=0x...
```

## 📁 Project Structure

```
zkrl/
├── packages/
│   ├── contracts/           # Smart contracts
│   │   ├── src/
│   │   │   ├── IdentityRegister.sol
│   │   │   ├── User.sol
│   │   │   ├── Bond.sol
│   │   │   ├── Lender.sol
│   │   │   └── factories/
│   │   └── script/          # Deployment scripts
│   └── web/                 # Frontend application
│       ├── src/
│       │   ├── app/        # Next.js app router
│       │   ├── components/ # React components
│       │   ├── hooks/      # Custom React hooks
│       │   └── lib/        # Utilities and contracts
│       └── public/
└── README.md
```

## 🔧 Development

### Smart Contract Development
```bash
cd packages/contracts

# Run tests
forge test

# Deploy to local network
forge script script/IdentityRegistry.s.sol --fork-url http://localhost:8545

# Deploy to Horizon
forge script script/IdentityRegistry.s.sol --rpc-url horizon --broadcast
```

### Frontend Development
```bash
cd packages/web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd packages/contracts
forge test -vvv
```

### Frontend Tests
```bash
cd packages/web
npm run test
```

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions and support, please open an issue on GitHub or contact the development team.
