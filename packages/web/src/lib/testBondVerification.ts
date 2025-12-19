// Test file for bond verification functionality
import { verifyBondCollateral, BondInfo, LoanRequest } from './bondVerification';

// Test data
const testBonds: BondInfo[] = [
  {
    address: "0x1234567890123456789012345678901234567890",
    amount: BigInt("1000000000000000000"), // 1 ETH
    isActive: true,
    owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    partner: "0x1111111111111111111111111111111111111111"
  },
  {
    address: "0x2345678901234567890123456789012345678901",
    amount: BigInt("2000000000000000000"), // 2 ETH
    isActive: true,
    owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    partner: "0x2222222222222222222222222222222222222222"
  },
  {
    address: "0x3456789012345678901234567890123456789012",
    amount: BigInt("500000000000000000"), // 0.5 ETH
    isActive: false, // Inactive bond
    owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    partner: "0x3333333333333333333333333333333333333333"
  }
];

const testLoanRequest: LoanRequest = {
  borrower: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  amount: BigInt("1500000000000000000"), // 1.5 ETH
  duration: 30,
  selectedBonds: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901"
  ],
  timestamp: Date.now()
};

// Test the verification
console.log("Testing bond verification...");
const result = verifyBondCollateral(testLoanRequest, testBonds, 150);

console.log("Verification Result:", {
  isValid: result.isValid,
  totalCollateralValue: result.totalCollateralValue.toString(),
  collateralRatio: result.collateralRatio,
  selectedBondsCount: result.selectedBondsCount,
  message: result.message
});

// Expected: Should be valid since 3 ETH collateral > 1.5 ETH loan (200% ratio > 150% required)
console.log("Expected: Valid (3 ETH collateral > 1.5 ETH loan)");
