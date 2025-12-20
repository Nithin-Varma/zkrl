"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAllLenders, useLenderContract } from "@/hooks/useLenderFactory";
import { useLenderContractInfo } from "@/hooks/useLenderContract";
import { useBondVerification } from "@/hooks/useBondVerification";
import { useUserBondsInfo } from "@/hooks/useBonds";
import { useUserBondsWithDetails } from "@/hooks/useBondDetails";
import { useLoanRequests } from "@/hooks/useLoanRequests";
import { BondAmountDisplay } from "@/components/BondAmountDisplay";
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
  Loader2,
  Send
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

  // Get user's bonds with detailed info
  const { bondsInfo: userBondsInfo, isLoading: bondsLoading } = useUserBondsInfo(userContractAddress);
  
  // Get detailed bond information (amounts, active status, etc.)
  const { bondsWithDetails, isLoading: bondsDetailsLoading } = useUserBondsWithDetails(
    userBondsInfo?.map(bond => bond.address) || []
  );

  // Use the bondsWithDetails directly since it now handles the basic info
  const fallbackBondsWithDetails = bondsWithDetails;

  // Use the fallback bonds if the detailed ones aren't available
  const finalBondsWithDetails = fallbackBondsWithDetails;

  // Function to get the total collateral value of selected bonds
  const getTotalCollateralValue = useMemo(() => {
    if (selectedBonds.length === 0) return 0;
    
    // For now, we'll use a placeholder calculation
    // In a real implementation, we'd fetch the actual amounts
    return selectedBonds.length * 1; // Placeholder: 1 ETH per bond
  }, [selectedBonds]);

  // Debug logging
  console.log("🔍 BorrowMoneyTabNew Debug:", {
    userBondsInfo,
    bondsWithDetails,
    fallbackBondsWithDetails,
    finalBondsWithDetails,
    bondsDetailsLoading,
    userBondsInfoLength: userBondsInfo?.length || 0,
    bondsWithDetailsLength: bondsWithDetails?.length || 0,
    finalBondsLength: finalBondsWithDetails?.length || 0
  });

  // Bond verification hook
  const { 
    verifyCollateral, 
    validateRequest, 
    getAvailableBonds,
    getMaxLoanAmount,
    isVerifying, 
    verificationResult,
    clearResult 
  } = useBondVerification();

  // Local state for verification result
  const [localVerificationResult, setLocalVerificationResult] = useState<any>(null);

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
    
    // Check if user has any active bonds
    if (!finalBondsWithDetails || finalBondsWithDetails.length === 0) {
      const errorResult = {
        isValid: false,
        totalCollateralValue: 0n,
        collateralRatio: 0,
        selectedBondsCount: 0,
        message: "No active bonds found. Please create and fund bonds first to use as collateral."
      };
      setLocalVerificationResult(errorResult);
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

    // For verification, we'll use the selected bonds with placeholder amounts
    // The actual verification will happen in the smart contract
    const bondInfos = selectedBonds.map((bondAddress) => ({
      address: bondAddress,
      amount: BigInt(1e18), // Placeholder: 1 ETH per bond for verification
      isActive: true,
      owner: address,
      partner: ""
    }));

    await verifyCollateral(loanRequest, bondInfos, 150); // 150% collateral ratio
    setShowVerification(true);
  };

  const handleRequestLoan = async () => {
    if (!selectedLender || !loanAmount || !loanDuration || selectedBonds.length === 0 || !address || !verificationResult?.isValid) return;
    
    try {
      const amountInWei = BigInt(parseFloat(loanAmount) * 1e18);
      const duration = parseInt(loanDuration);
      
      // Create loan request instead of calling contract
      const request = createRequest(
        selectedLender,
        amountInWei,
        duration,
        selectedBonds,
        verificationResult.totalCollateralValue,
        verificationResult.collateralRatio,
        `Loan request for ${loanAmount} ETH for ${duration} days`
      );
      
      console.log("Loan request created:", request);
      alert(`Loan request submitted to ${selectedLender.slice(0, 10)}...! The lender will review your request.`);
      
      // Reset form
      setSelectedBonds([]);
      setLoanAmount("");
      setLoanDuration("");
      setShowVerification(false);
      clearResult();
      
    } catch (error) {
      console.error("Loan request failed:", error);
      alert("Failed to create loan request. Please try again.");
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
          Use your trust bonds as collateral to request loans from lenders
        </p>
      </div>

      {/* Available Lenders */}
      <Card>
        <CardHeader>
          <CardTitle>Available Lenders</CardTitle>
          <CardDescription>
            Choose a lender to request a loan from. Each lender has different interest rates and available funds.
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
            {/* No Active Bonds Available Message */}
            {!bondsLoading && !bondsDetailsLoading && finalBondsWithDetails.length === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-700">No Active Bonds Available</h4>
                    <p className="text-sm text-red-600 mt-1">
                      You don't have any active bonds to use as collateral. Please create and fund bonds first in the "My Bonds" tab.
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
                  {finalBondsWithDetails && finalBondsWithDetails.length > 0 ? (
                    finalBondsWithDetails.map((bond) => (
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
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">{bond.address.slice(0, 10)}...</span>
                            <BondAmountDisplay 
                              bondAddress={bond.address}
                              fallbackAmount="Loading amount..."
                            />
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <p className="text-sm">No active bonds found</p>
                      <p className="text-xs mt-1">Create and fund bonds first to use as collateral</p>
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
                    <span>Bond Amounts:</span>
                    <span className="text-sm text-slate-500">
                      See individual amounts above
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Note:</span>
                    <span className="text-xs text-slate-500">
                      Actual amounts will be verified during loan request
                    </span>
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
                      {(verificationResult || localVerificationResult) && (
                        <div className={`p-4 rounded-lg border ${
                          (verificationResult || localVerificationResult)?.isValid 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {(verificationResult || localVerificationResult)?.isValid ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span className={`font-medium ${
                              (verificationResult || localVerificationResult)?.isValid ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {(verificationResult || localVerificationResult)?.isValid ? 'Collateral Verified' : 'Verification Failed'}
                            </span>
                          </div>
                          <p className="text-sm mt-2 text-slate-600">
                            {(verificationResult || localVerificationResult)?.message}
                          </p>
                          {(verificationResult || localVerificationResult)?.isValid && (
                            <div className="mt-3 text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Total Collateral:</span>
                                <span>{Number((verificationResult || localVerificationResult)?.totalCollateralValue) / 1e18} ETH</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Collateral Ratio:</span>
                                <span>{(verificationResult || localVerificationResult)?.collateralRatio?.toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bonds Used:</span>
                                <span>{(verificationResult || localVerificationResult)?.selectedBondsCount}</span>
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
                          disabled={!(verificationResult || localVerificationResult)?.isValid || isCreatingRequest}
                          className="flex-1"
                        >
                          {isCreatingRequest ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting Request...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Request
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
              <h4 className="font-semibold">1. Submit Request</h4>
              <p className="text-xs text-slate-500 mt-1">
                Choose bonds as collateral and submit loan request
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">2. Lender Review</h4>
              <p className="text-xs text-slate-500 mt-1">
                Lender reviews your request and collateral
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold">3. Get Approved</h4>
              <p className="text-xs text-slate-500 mt-1">
                Lender approves and sends funds to you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
