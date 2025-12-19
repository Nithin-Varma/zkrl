"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreateLenderContract, useLenderContract, useHasLenderContract } from "@/hooks/useLenderFactory";
import { useAddFunds, useSetInterestRate, useWithdrawFunds, useLenderContractInfo } from "@/hooks/useLenderContract";
import { useLoanRequests } from "@/hooks/useLoanRequests";
import { useVerifyAndLend } from "@/hooks/useLenderContract";
import { useAccount } from "wagmi";
import { 
  DollarSign, 
  TrendingUp, 
  Settings,
  Plus,
  Minus,
  Wallet,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  X,
  Loader2,
  Users
} from "lucide-react";
import { formatAmount, formatDuration, formatCollateralRatio } from "@/lib/loanRequests";

export function UnifiedLenderInterface() {
  const { address } = useAccount();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [initialInterestRate, setInitialInterestRate] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Hooks
  const { createLender, isPending: isCreating } = useCreateLenderContract();
  const { hasContract, isLoading: hasContractLoading } = useHasLenderContract(address);
  const { contractAddress, isLoading: contractLoading } = useLenderContract(address);
  const { addFunds, isPending: isAddingFunds } = useAddFunds(contractAddress);
  const { setInterestRate: updateInterestRate, isPending: isUpdatingRate } = useSetInterestRate(contractAddress);
  const { withdrawFunds, isPending: isWithdrawing } = useWithdrawFunds(contractAddress);
  const { 
    interestRate: currentRate, 
    totalFunds, 
    availableFunds, 
    balance,
    isLoading: infoLoading 
  } = useLenderContractInfo(contractAddress);

  // Loan requests
  const { 
    lenderRequests, 
    isLoading: requestsLoading, 
    approveRequest, 
    rejectRequest,
    refreshRequests 
  } = useLoanRequests();
  
  // Get verify and lend hook
  const { verifyAndLend, isPending: isLending, isConfirmed: isLent } = useVerifyAndLend(contractAddress);

  const handleCreateContract = () => {
    if (!initialInterestRate) return;
    const ratePercentage = parseInt(initialInterestRate);
    createLender(ratePercentage);
  };

  const handleAddFunds = () => {
    if (!fundAmount) return;
    const amountInWei = BigInt(parseFloat(fundAmount) * 1e18);
    addFunds(amountInWei);
    setFundAmount("");
    setShowAddFunds(false);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    const amountInWei = BigInt(parseFloat(withdrawAmount) * 1e18);
    withdrawFunds(amountInWei);
    setWithdrawAmount("");
    setShowWithdraw(false);
  };

  const handleSetInterestRate = () => {
    if (!interestRate) return;
    const rateInBasisPoints = parseInt(interestRate) * 100; // Convert percentage to basis points
    updateInterestRate(rateInBasisPoints);
    setInterestRate("");
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!contractAddress) {
      alert("No lender contract found. Please create a lender contract first.");
      return;
    }

    const request = lenderRequests.find(r => r.id === requestId);
    if (!request) {
      alert("Request not found.");
      return;
    }

    // Check if lender has sufficient funds
    if (availableFunds && request.amount > availableFunds) {
      alert(`Insufficient funds. You have ${Number(availableFunds) / 1e18} ETH available, but the request is for ${Number(request.amount) / 1e18} ETH.`);
      return;
    }

    setIsProcessing(true);
    try {
      // First, call the smart contract to send funds
      const durationInSeconds = request.duration * 24 * 60 * 60; // Convert days to seconds
      const proof = "0x" + "0".repeat(64); // Placeholder proof for now
      
      await verifyAndLend(
        request.borrower as `0x${string}`,
        request.amount,
        BigInt(durationInSeconds),
        request.selectedBonds as `0x${string}`[],
        proof as `0x${string}`
      );
      
      // Wait for transaction confirmation
      if (isLent) {
        // Update request status after successful transaction
        await approveRequest(requestId);
        alert("Loan request approved! Funds have been sent to the borrower.");
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve loan request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setIsProcessing(true);
    try {
      await rejectRequest(requestId);
      alert("Loan request rejected.");
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject loan request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasContractLoading || contractLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hasContract) {
    return (
      <div className="text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Become a Lender</h2>
          <p className="text-slate-600">
            Create your lender contract to start earning interest on your funds
          </p>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-green-500" />
              Create Lender Contract
            </CardTitle>
            <CardDescription>
              Deploy your personal lender contract to start lending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialInterestRate">Initial Interest Rate (%)</Label>
              <Input
                id="initialInterestRate"
                type="number"
                step="0.1"
                placeholder="5.0"
                value={initialInterestRate}
                onChange={(e) => setInitialInterestRate(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Set your initial interest rate for loans (you can change this later)
              </p>
            </div>
            <Button 
              onClick={handleCreateContract}
              disabled={isCreating || !initialInterestRate}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Lender Contract"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Lender Dashboard</h2>
        <p className="text-slate-600">
          Manage your lending contract and earn interest on your funds
        </p>
        {!infoLoading && availableFunds !== undefined && (
          <div className="mt-4 inline-block">
            <Badge variant="outline" className="text-sm">
              Available Funds: {Number(availableFunds) / 1e18} ETH
            </Badge>
          </div>
        )}
      </div>

      {/* Contract Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funds</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {infoLoading ? "Loading..." : `${Number(totalFunds || 0) / 1e18} ETH`}
            </div>
            <div className="text-xs text-slate-500">
              Available: {infoLoading ? "..." : `${Number(availableFunds || 0) / 1e18} ETH`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {infoLoading ? "Loading..." : `${Number(currentRate || 0) / 100}%`}
            </div>
            <div className="text-xs text-slate-500">
              Annual rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Balance</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {infoLoading ? "Loading..." : `${Number(balance || 0) / 1e18} ETH`}
            </div>
            <div className="text-xs text-slate-500">
              Current balance
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fund Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>
              Add ETH to your lender contract to make it available for lending
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showAddFunds ? (
              <Button onClick={() => setShowAddFunds(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fundAmount">Amount (ETH)</Label>
                <Input
                  id="fundAmount"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAddFunds}
                    disabled={isAddingFunds || !fundAmount}
                    className="flex-1"
                  >
                    {isAddingFunds ? "Adding..." : "Add Funds"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddFunds(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Funds</CardTitle>
            <CardDescription>
              Withdraw ETH from your lender contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showWithdraw ? (
              <Button onClick={() => setShowWithdraw(true)} variant="outline" className="w-full">
                <Minus className="w-4 h-4 mr-2" />
                Withdraw Funds
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Amount (ETH)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount}
                    variant="outline"
                    className="flex-1"
                  >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                  </Button>
                  <Button 
                    onClick={() => setShowWithdraw(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interest Rate Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Interest Rate Settings
          </CardTitle>
          <CardDescription>
            Set the interest rate for loans from your contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSetInterestRate}
            disabled={isUpdatingRate || !interestRate}
            className="w-full"
          >
            {isUpdatingRate ? "Updating..." : "Set Interest Rate"}
          </Button>
        </CardContent>
      </Card>

      {/* Loan Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Pending Loan Requests
          </CardTitle>
          <CardDescription>
            Review loan requests and approve or reject them
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : lenderRequests.length > 0 ? (
            <div className="space-y-4">
              {lenderRequests.map((request) => (
                <div 
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {request.status}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Amount:</span>
                          <div className="text-slate-600">{formatAmount(request.amount)}</div>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <div className="text-slate-600">{formatDuration(request.duration)}</div>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Borrower:</span>
                        <span className="text-slate-600 ml-2 font-mono">{request.borrower.slice(0, 10)}...</span>
                      </div>
                      
                      {request.message && (
                        <div className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Message:</span> {request.message}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedRequest(request.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={isProcessing || isLending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing || isLending ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        {isLending ? "Sending Funds..." : "Approve & Send"}
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={isProcessing}
                        variant="destructive"
                        size="sm"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-1" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
              <p className="text-sm">No loan requests are currently pending your review.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Address */}
      <Card>
        <CardHeader>
          <CardTitle>Your Lender Contract</CardTitle>
          <CardDescription>
            Your personal lender contract address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm break-all bg-slate-100 p-2 rounded">
            {contractAddress || "Loading..."}
          </div>
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Loan Request Details</CardTitle>
              <CardDescription>
                Review all details before making a decision
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const request = lenderRequests.find(r => r.id === selectedRequest);
                if (!request) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Request ID</label>
                        <div className="text-sm font-mono">{request.id}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Status</label>
                        <div className="text-sm">
                          <Badge variant="outline">{request.status}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Borrower</label>
                        <div className="text-sm font-mono">{request.borrower}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Created</label>
                        <div className="text-sm">{new Date(request.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Loan Amount</label>
                        <div className="text-lg font-semibold">{formatAmount(request.amount)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Duration</label>
                        <div className="text-lg font-semibold">{formatDuration(request.duration)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-500">Collateral Value</label>
                        <div className="text-lg font-semibold">{formatAmount(request.collateralValue)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-500">Collateral Ratio</label>
                        <div className="text-lg font-semibold">{formatCollateralRatio(request.collateralRatio)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-500">Selected Bonds</label>
                      <div className="mt-1 space-y-1">
                        {request.selectedBonds.map((bond, index) => (
                          <div key={index} className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                            {bond}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {request.message && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Message</label>
                        <div className="text-sm bg-slate-50 p-3 rounded mt-1">
                          {request.message}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={isProcessing || isLending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing || isLending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {isLending ? "Sending Funds..." : "Approve & Send Funds"}
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={isProcessing}
                        variant="destructive"
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

