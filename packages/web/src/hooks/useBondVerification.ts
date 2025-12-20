import { useState, useCallback } from 'react';
import { 
  verifyBondCollateral, 
  validateLoanRequest, 
  calculateMaxLoanAmount,
  getAvailableCollateralBonds,
  BondInfo,
  LoanRequest,
  VerificationResult 
} from '@/lib/bondVerification';

export function useBondVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  /**
   * Verify bond collateral for loan request
   */
  const verifyCollateral = useCallback(async (
    loanRequest: LoanRequest,
    userBonds: BondInfo[],
    minimumCollateralRatio: number = 150
  ): Promise<VerificationResult> => {
    setIsVerifying(true);
    
    try {
      const result = verifyBondCollateral(loanRequest, userBonds, minimumCollateralRatio);
      setVerificationResult(result);
      return result;
    } catch (error) {
      const errorResult: VerificationResult = {
        isValid: false,
        totalCollateralValue: 0n,
        collateralRatio: 0,
        selectedBondsCount: 0,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      setVerificationResult(errorResult);
      return errorResult;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  /**
   * Validate loan request before submission
   */
  const validateRequest = useCallback((
    loanRequest: LoanRequest,
    userBonds: BondInfo[],
    minimumCollateralRatio: number = 150
  ) => {
    return validateLoanRequest(loanRequest, userBonds, minimumCollateralRatio);
  }, []);

  /**
   * Get available bonds for collateral
   */
  const getAvailableBonds = useCallback((userBonds: BondInfo[]) => {
    return getAvailableCollateralBonds(userBonds);
  }, []);

  /**
   * Calculate maximum loan amount
   */
  const getMaxLoanAmount = useCallback((
    userBonds: BondInfo[],
    collateralRatio: number = 150
  ) => {
    return calculateMaxLoanAmount(userBonds, collateralRatio);
  }, []);

  return {
    verifyCollateral,
    validateRequest,
    getAvailableBonds,
    getMaxLoanAmount,
    isVerifying,
    verificationResult,
    clearResult: () => setVerificationResult(null)
  };
}
