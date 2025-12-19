import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  createLoanRequest, 
  getLoanRequestsForLender, 
  getLoanRequestsForBorrower,
  updateLoanRequestStatus,
  LoanRequest 
} from '@/lib/loanRequests';

export function useLoanRequests() {
  const { address } = useAccount();
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get requests for current user (as lender)
  const lenderRequests = requests.filter(request => 
    request.lender.toLowerCase() === address?.toLowerCase()
  );

  // Get requests for current user (as borrower)
  const borrowerRequests = requests.filter(request => 
    request.borrower.toLowerCase() === address?.toLowerCase()
  );

  const refreshRequests = () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const lenderReqs = getLoanRequestsForLender(address);
      const borrowerReqs = getLoanRequestsForBorrower(address);
      setRequests([...lenderReqs, ...borrowerReqs]);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = (
    lender: string,
    amount: bigint,
    duration: number,
    selectedBonds: string[],
    collateralValue: bigint,
    collateralRatio: number,
    message?: string
  ): LoanRequest => {
    if (!address) throw new Error('No wallet connected');
    
    const request = createLoanRequest(
      address,
      lender,
      amount,
      duration,
      selectedBonds,
      collateralValue,
      collateralRatio,
      message
    );
    
    refreshRequests();
    return request;
  };

  const approveRequest = (requestId: string) => {
    const success = updateLoanRequestStatus(requestId, 'approved', Date.now());
    if (success) {
      refreshRequests();
    }
    return success;
  };

  const rejectRequest = (requestId: string) => {
    const success = updateLoanRequestStatus(requestId, 'rejected', Date.now());
    if (success) {
      refreshRequests();
    }
    return success;
  };

  const completeRequest = (requestId: string) => {
    const success = updateLoanRequestStatus(requestId, 'completed', Date.now());
    if (success) {
      refreshRequests();
    }
    return success;
  };

  useEffect(() => {
    refreshRequests();
  }, [address]);

  return {
    requests,
    lenderRequests,
    borrowerRequests,
    isLoading,
    createRequest,
    approveRequest,
    rejectRequest,
    completeRequest,
    refreshRequests
  };
}
