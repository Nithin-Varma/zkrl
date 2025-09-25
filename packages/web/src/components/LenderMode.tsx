"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreateLenderContract, useLenderContract, useHasLenderContract } from "@/hooks/useLenderFactory";
import { useAddFunds, useSetInterestRate, useWithdrawFunds, useLenderContractInfo } from "@/hooks/useLenderContract";
import { useAccount } from "wagmi";
import { 
  DollarSign, 
  TrendingUp, 
  Settings,
  Plus,
  Minus,
  Wallet,
  Clock
} from "lucide-react";

export function LenderMode() {
  const { address } = useAccount();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [initialInterestRate, setInitialInterestRate] = useState("");
  
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
    </div>
  );
}
