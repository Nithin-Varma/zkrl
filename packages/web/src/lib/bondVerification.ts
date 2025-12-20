// Bond Collateral Verification Functions

export interface BondInfo {
  address: string;
  amount: bigint;
  isActive: boolean;
  owner: string;
  partner: string;
}

export interface LoanRequest {
  borrower: string;
  amount: bigint;
  duration: number;
  selectedBonds: string[];
  timestamp: number;
}

export interface VerificationResult {
  isValid: boolean;
  totalCollateralValue: bigint;
  collateralRatio: number;
  selectedBondsCount: number;
  message: string;
}

/**
 * Verify if user has sufficient bond collateral for loan request
 * @param loanRequest - The loan request details
 * @param userBonds - Array of user's bond information
 * @param minimumCollateralRatio - Required collateral ratio (e.g., 150 for 150%)
 * @returns VerificationResult with validation details
 */
export function verifyBondCollateral(
  loanRequest: LoanRequest,
  userBonds: BondInfo[],
  minimumCollateralRatio: number = 150
): VerificationResult {
  try {
    // 1. Validate loan request
    if (loanRequest.amount <= 0) {
      return {
        isValid: false,
        totalCollateralValue: 0n,
        collateralRatio: 0,
        selectedBondsCount: 0,
        message: "Invalid loan amount"
      };
    }

    // 2. Check if user has any bonds
    if (!userBonds || userBonds.length === 0) {
      return {
        isValid: false,
        totalCollateralValue: 0n,
        collateralRatio: 0,
        selectedBondsCount: 0,
        message: "No bonds found for user"
      };
    }

    // 3. Filter selected bonds that are active and owned by user
    const selectedBondInfos = userBonds.filter(bond => 
      loanRequest.selectedBonds.includes(bond.address) &&
      bond.isActive &&
      bond.owner.toLowerCase() === loanRequest.borrower.toLowerCase()
    );

    // 4. Check if any bonds were selected
    if (selectedBondInfos.length === 0) {
      return {
        isValid: false,
        totalCollateralValue: 0n,
        collateralRatio: 0,
        selectedBondsCount: 0,
        message: "No valid bonds selected or user doesn't own them"
      };
    }

    // 5. Calculate total collateral value
    const totalCollateralValue = selectedBondInfos.reduce(
      (sum, bond) => sum + bond.amount,
      0n
    );

    // 6. Calculate collateral ratio
    const collateralRatio = Number((totalCollateralValue * 100n) / loanRequest.amount);

    // 7. Check if collateral ratio meets minimum requirement
    const meetsCollateralRequirement = collateralRatio >= minimumCollateralRatio;

    // 8. Check if total value is sufficient
    const hasSufficientCollateral = totalCollateralValue >= loanRequest.amount;

    // 9. Final validation
    const isValid = meetsCollateralRequirement && hasSufficientCollateral;

    return {
      isValid,
      totalCollateralValue,
      collateralRatio,
      selectedBondsCount: selectedBondInfos.length,
      message: isValid 
        ? `Collateral verified: ${selectedBondInfos.length} bonds worth ${formatEther(totalCollateralValue)} ETH (${collateralRatio.toFixed(1)}% ratio)`
        : `Insufficient collateral: ${collateralRatio.toFixed(1)}% (required: ${minimumCollateralRatio}%)`
    };

  } catch (error) {
    return {
      isValid: false,
      totalCollateralValue: 0n,
      collateralRatio: 0,
      selectedBondsCount: 0,
      message: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Format ether value for display
 */
function formatEther(wei: bigint): string {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(4);
}

/**
 * Get user's available bonds for collateral
 * @param userBonds - Array of user's bond information
 * @returns Array of bonds that can be used as collateral
 */
export function getAvailableCollateralBonds(userBonds: BondInfo[]): BondInfo[] {
  return userBonds.filter(bond => 
    bond.isActive && 
    bond.amount > 0n &&
    bond.owner && 
    bond.owner !== '0x0000000000000000000000000000000000000000'
  );
}

/**
 * Calculate maximum loan amount based on available collateral
 * @param userBonds - Array of user's bond information
 * @param collateralRatio - Required collateral ratio (e.g., 150 for 150%)
 * @returns Maximum loan amount in wei
 */
export function calculateMaxLoanAmount(
  userBonds: BondInfo[], 
  collateralRatio: number = 150
): bigint {
  const availableBonds = getAvailableCollateralBonds(userBonds);
  const totalCollateralValue = availableBonds.reduce(
    (sum, bond) => sum + bond.amount,
    0n
  );
  
  // Max loan = (total collateral * 100) / collateral ratio
  return (totalCollateralValue * 100n) / BigInt(collateralRatio);
}

/**
 * Validate loan request before submission
 * @param loanRequest - The loan request to validate
 * @param userBonds - User's available bonds
 * @param minimumCollateralRatio - Required collateral ratio
 * @returns Validation result
 */
export function validateLoanRequest(
  loanRequest: LoanRequest,
  userBonds: BondInfo[],
  minimumCollateralRatio: number = 150
): { isValid: boolean; message: string } {
  // Check if loan amount is positive
  if (loanRequest.amount <= 0) {
    return { isValid: false, message: "Loan amount must be positive" };
  }

  // Check if duration is reasonable
  if (loanRequest.duration <= 0 || loanRequest.duration > 365) {
    return { isValid: false, message: "Loan duration must be between 1 and 365 days" };
  }

  // Check if bonds are selected
  if (!loanRequest.selectedBonds || loanRequest.selectedBonds.length === 0) {
    return { isValid: false, message: "Please select at least one bond as collateral" };
  }

  // Verify collateral
  const verification = verifyBondCollateral(loanRequest, userBonds, minimumCollateralRatio);
  
  return {
    isValid: verification.isValid,
    message: verification.message
  };
}
