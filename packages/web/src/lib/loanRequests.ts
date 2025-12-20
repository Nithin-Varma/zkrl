// Loan Request Management System

export interface LoanRequest {
  id: string;
  borrower: string;
  borrowerName?: string;
  lender: string;
  amount: bigint;
  duration: number; // in days
  selectedBonds: string[];
  collateralValue: bigint;
  collateralRatio: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: number;
  verifiedAt?: number;
  message?: string;
}

export interface BondInfo {
  address: string;
  amount: bigint;
  isActive: boolean;
  owner: string;
  partner: string;
}

// In-memory storage for loan requests (in production, this would be a database)
let loanRequests: LoanRequest[] = [];

export function createLoanRequest(
  borrower: string,
  lender: string,
  amount: bigint,
  duration: number,
  selectedBonds: string[],
  collateralValue: bigint,
  collateralRatio: number,
  message?: string
): LoanRequest {
  const request: LoanRequest = {
    id: `loan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    borrower,
    lender,
    amount,
    duration,
    selectedBonds,
    collateralValue,
    collateralRatio,
    status: 'pending',
    createdAt: Date.now(),
    message
  };

  loanRequests.push(request);
  return request;
}

export function getLoanRequestsForLender(lender: string): LoanRequest[] {
  return loanRequests.filter(request => 
    request.lender.toLowerCase() === lender.toLowerCase() && 
    request.status === 'pending'
  );
}

export function getLoanRequestsForBorrower(borrower: string): LoanRequest[] {
  return loanRequests.filter(request => 
    request.borrower.toLowerCase() === borrower.toLowerCase()
  );
}

export function updateLoanRequestStatus(
  requestId: string, 
  status: 'approved' | 'rejected' | 'completed',
  verifiedAt?: number
): boolean {
  const request = loanRequests.find(r => r.id === requestId);
  if (request) {
    request.status = status;
    if (verifiedAt) {
      request.verifiedAt = verifiedAt;
    }
    return true;
  }
  return false;
}

export function getLoanRequest(requestId: string): LoanRequest | undefined {
  return loanRequests.find(r => r.id === requestId);
}

export function getAllLoanRequests(): LoanRequest[] {
  return loanRequests;
}

// Format functions for display
export function formatAmount(amount: bigint): string {
  const eth = Number(amount) / 1e18;
  return `${eth.toFixed(4)} ETH`;
}

export function formatDuration(days: number): string {
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''}`;
}

export function formatCollateralRatio(ratio: number): string {
  return `${ratio.toFixed(1)}%`;
}
