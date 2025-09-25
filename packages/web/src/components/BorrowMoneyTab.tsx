"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAllLenders, useLenderContract } from "@/hooks/useLenderFactory";
import { useLenderContractInfo } from "@/hooks/useLenderContract";
import { 
  DollarSign, 
  Clock, 
  TrendingUp,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from "lucide-react";

interface BorrowMoneyTabProps {
  userContractAddress?: string;
  bondsInfo: Array<{ address: string }>;
}

export function BorrowMoneyTab({ userContractAddress, bondsInfo }: BorrowMoneyTabProps) {
  const [selectedLender, setSelectedLender] = useState<string>("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [selectedBonds, setSelectedBonds] = useState<string[]>([]);
  const [showBondSelection, setShowBondSelection] = useState(false);
  
  // Get all available lenders
  const { lenders, isLoading: lendersLoading } = useAllLenders();
  
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

  const handleBondSelection = (bondAddress: string) => {
    if (selectedBonds.includes(bondAddress)) {
      setSelectedBonds(selectedBonds.filter(addr => addr !== bondAddress));
    } else {
      setSelectedBonds([...selectedBonds, bondAddress]);
    }
  };

  const handleRequestLoan = () => {
    if (!selectedLender || !loanAmount || !loanDuration || selectedBonds.length === 0) return;
    
    // Calculate total bond value (placeholder)
    const totalBondValue = selectedBonds.length * 1; // 1 ETH per bond placeholder
    
    if (parseFloat(loanAmount) > totalBondValue) {
      alert("Loan amount exceeds bond collateral value");
      return;
    }
    
    // Here you would call the verifyAndLend function
    console.log("Requesting loan:", {
      lender: selectedLender,
      amount: loanAmount,
      duration: loanDuration,
      bonds: selectedBonds
    });
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
            {lenders && lenders.length > 0 ? (
              lenders.map((lender, index) => (
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
                No lenders available yet
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount (ETH)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanDuration">Duration (days)</Label>
                <Input
                  id="loanDuration"
                  type="number"
                  placeholder="30"
                  value={loanDuration}
                  onChange={(e) => setLoanDuration(e.target.value)}
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
                  {bondsInfo.map((bond) => (
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
                  ))}
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

            <Button 
              onClick={handleRequestLoan}
              disabled={!loanAmount || !loanDuration || selectedBonds.length === 0}
              className="w-full"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Request Loan
            </Button>
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
