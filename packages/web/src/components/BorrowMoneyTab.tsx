"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAllLenders, useLenderContract } from "@/hooks/useLenderFactory";
import { useLenderContractInfo, useVerifyAndLend } from "@/hooks/useLenderContract";
import { useBondVerification } from "@/hooks/useBondVerification";
import { useUserBondsInfo } from "@/hooks/useBonds";
import { useLoanRequests } from "@/hooks/useLoanRequests";
import { useAccount } from "wagmi";
import { 
  DollarSign, 
  Clock, 
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
  Loader2
} from "lucide-react";

interface BorrowMoneyTabProps {
  userContractAddress?: string;
  bondsInfo: Array<{ address: string }>;
}

export function BorrowMoneyTab({ userContractAddress, bondsInfo }: BorrowMoneyTabProps) {
  const { address } = useAccount();
  const [selectedLender, setSelectedLender] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [selectedBonds, setSelectedBonds] = useState<string[]>([]);
  const [showBondSelection, setShowBondSelection] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  // Get all available lenders
  const { lenders, isLoading: lendersLoading } = useAllLenders();
  
  // Filter out current user's own lender contract
  const availableLenders = lenders?.filter(lender => 
    lender.toLowerCase() !== address?.toLowerCase()
  ) || [];
  
  // Get selected lender's contract address
  const { contractAddress: selectedLenderContract } = useLenderContract(selectedLender);
  
  // Get selected lender info
  const {
    interestRate,
    totalFunds,
    availableFunds,
    balance,
    isLoading: lenderInfoLoading
  } = useLenderContractInfo(selectedLenderContract);

  // Verify and lend hook
  const { verifyAndLend, isPending: isLending } = useVerifyAndLend(selectedLenderContract);

  // Get user's bonds with detailed info
  const { bondsInfo: userBondsInfo, isLoading: bondsLoading } = useUserBondsInfo(userContractAddress);

  // Bond verification hook
  const {
    verifyCollateral,
    validateRequest,
    getAvailableBonds,
    getMaxLoanAmount,
    isVerifying,
    verificationResult,
    setVerificationResult,
    clearResult
  } = useBondVerification();

  // Loan requests hook
  const { createRequest, isLoading: isCreatingRequest } = useLoanRequests();

  const handleBondSelection = (bondAddress: string) => {
    if (selectedBonds.includes(bondAddress)) {
      setSelectedBonds(selectedBonds.filter(addr => addr !== bondAddress));
    } else {
      setSelectedBonds([...selectedBonds, bondAddress]);
    }
    clearResult(); // Clear previous verification when bonds change
    setShowVerification(false); // Reset verification step
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanAmount(e.target.value);
    clearResult(); // Clear previous verification when amount changes
    setShowVerification(false); // Reset verification step
  };

  const handleLoanDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoanDuration(e.target.value);
    clearResult(); // Clear previous verification when duration changes
    setShowVerification(false); // Reset verification step
  };

  const handleVerifyCollateral = async () => {
    if (!selectedLender || !loanAmount || !loanDuration || selectedBonds.length === 0 || !address) return;
    
    // Check if user has any bonds
    if (!userBondsInfo || userBondsInfo.length === 0) {
      const errorResult = {
        isValid: false,
        totalCollateralValue: 0n,
        collateralRatio: 0,
        selectedBondsCount: 0,
        message: "No bonds found. Please create bonds first to use as collateral."
      };
      setVerificationResult(errorResult);
      setShowVerification(true);
      return;
    }
    
    const loanRequest = {
      borrower: address,
      amount: BigInt(parseFloat(loanAmount) * 1e18),
      duration: parseInt(loanDuration),
      selectedBonds,
      timestamp: Date.now()
    };

    // Convert bondsInfo to BondInfo format with proper data
    const bondInfos = userBondsInfo.map((bond: any) => ({
      address: bond.address,
      amount: bond.totalBondAmount,
      isActive: true, // Assume active for now
      owner: address,
      partner: bond.partner || ""
    }));

    await verifyCollateral(loanRequest, bondInfos, 150); // 150% collateral ratio
    setShowVerification(true);
  };

  const handleRequestLoan = async () => {
    if (!selectedLender || !loanAmount || !loanDuration || selectedBonds.length === 0 || !address || !verificationResult?.isValid) return;
    
    try {
      const amountInWei = BigInt(parseFloat(loanAmount) * 1e18);
      const durationInSeconds = parseInt(loanDuration) * 24 * 60 * 60; // Convert days to seconds
      const proof = "0x" + "0".repeat(64); // Placeholder proof for now
      
      await verifyAndLend(
        address as `0x${string}`,
        amountInWei,
        durationInSeconds,
        selectedBonds as `0x${string}`[],
        proof as `0x${string}`
      );
    } catch (error) {
      console.error("Loan request failed:", error);
    }
  };

  if (lendersLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Borrow Money</h2>
        <p className="text-slate-600">
          Use your trust bonds as collateral to borrow money from lenders
        </p>
      </div>

      {/* Available Lenders */}
      <Card>
        <CardHeader>
          <CardTitle>Available Lenders</CardTitle>
          <CardDescription>
            Choose a lender to borrow from. Each lender has different interest rates and available funds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableLenders && availableLenders.length > 0 ? (
              availableLenders.map((lender, index) => (
                <div 
                  key={lender} 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLender === lender 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedLender(lender)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-sm">{lender.slice(0, 10)}...</div>
                      <div className="text-xs text-slate-500">Lender #{index + 1}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {lenderInfoLoading ? "Loading..." : `${Number(interestRate || 0) / 100}% APR`}
                      </div>
                      <div className="text-xs text-slate-500">
                        Available: {lenderInfoLoading ? "..." : `${Number(availableFunds || 0) / 1e18} ETH`}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                {lenders && lenders.length > 0 ? 
                  "No other lenders available (excluding your own lender contract)" :
                  "No lenders available yet"
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loan Request Form */}
      {selectedLender && (
        <Card>
          <CardHeader>
            <CardTitle>Request Loan</CardTitle>
            <CardDescription>
              Specify the amount you want to borrow and select bonds as collateral.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* No Bonds Available Message */}
            {!bondsLoading && (!userBondsInfo || userBondsInfo.length === 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-700">No Bonds Available</h4>
                    <p className="text-sm text-red-600 mt-1">
                      You don't have any bonds to use as collateral. Please create bonds first in the "My Bonds" tab.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount (ETH)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={loanAmount}
                  onChange={handleLoanAmountChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanDuration">Duration (days)</Label>
                <Input
                  id="loanDuration"
                  type="number"
                  placeholder="30"
                  value={loanDuration}
                  onChange={handleLoanDurationChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Bonds as Collateral</Label>
              <Button
                onClick={() => setShowBondSelection(!showBondSelection)}
                variant="outline"
                className="w-full"
              >
                {selectedBonds.length > 0 
                  ? `${selectedBonds.length} bonds selected` 
                  : "Select Bonds"
                }
              </Button>
              
              {showBondSelection && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userBondsInfo && userBondsInfo.length > 0 ? (
                    userBondsInfo.map((bond) => (
                      <div 
                        key={bond.address}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedBonds.includes(bond.address)}
                            onChange={() => handleBondSelection(bond.address)}
                          />
                          <span className="font-mono text-sm">{bond.address.slice(0, 10)}...</span>
                        </div>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <p className="text-sm">No bonds found</p>
                      <p className="text-xs mt-1">Create bonds first to use as collateral</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Collateral Summary */}
            {selectedBonds.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Collateral Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Selected Bonds:</span>
                    <span>{selectedBonds.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Value:</span>
                    <span>{selectedBonds.length} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Loan Amount:</span>
                    <span>{selectedBonds.length * 0.8} ETH (80% LTV)</span>
                  </div>
                </div>
              </div>
            )}


            {/* Verification Step - Always show if bonds are selected */}
            {selectedBonds.length > 0 && (
              <div className="space-y-4">
                {loanAmount !== "" && loanDuration !== "" ? (
                  !showVerification ? (
                    <div className="space-y-2">
                      <Button 
                        onClick={handleVerifyCollateral}
                        disabled={isVerifying}
                        className="w-full"
                        variant="outline"
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying Collateral...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Verify Collateral
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-slate-500 text-center">
                        Click to verify your bond collateral is sufficient for the loan
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Verification Result */}
                      {verificationResult && (
                        <div className={`p-4 rounded-lg border ${
                          verificationResult.isValid 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {verificationResult.isValid ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className={`font-medium ${
                              verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {verificationResult.isValid ? 'Collateral Verified' : 'Verification Failed'}
                            </span>
                          </div>
                          <p className="text-sm mt-2 text-slate-600">
                            {verificationResult.message}
                          </p>
                          {verificationResult.isValid && (
                            <div className="mt-3 text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Total Collateral:</span>
                                <span>{Number(verificationResult.totalCollateralValue) / 1e18} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Collateral Ratio:</span>
                                <span>{verificationResult.collateralRatio.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bonds Used:</span>
                                <span>{verificationResult.selectedBondsCount}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => {
                            setShowVerification(false);
                            clearResult();
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Reset
                        </Button>
                        <Button 
                          onClick={handleRequestLoan}
                          disabled={!verificationResult?.isValid || isLending}
                          className="flex-1"
                        >
                          {isLending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing Loan...
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Request Loan
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-sm">Please enter loan amount and duration to verify collateral</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Bond-Backed Lending Works</CardTitle>
          <CardDescription>
            Understanding the lending process and your responsibilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold">1. Select Bonds</h4>
              <p className="text-xs text-slate-500 mt-1">
                Choose your trust bonds as collateral
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">2. Get Loan</h4>
              <p className="text-xs text-slate-500 mt-1">
                Receive funds based on bond value
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold">3. Repay & Reclaim</h4>
              <p className="text-xs text-slate-500 mt-1">
                Repay loan to get bonds back
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
