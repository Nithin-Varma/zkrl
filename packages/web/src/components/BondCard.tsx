"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useBondInfo } from "@/hooks/useBonds";
import { useStake, useWithdraw, useBreakBond } from "@/hooks/useBond";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Coins, ArrowDownLeft, X } from "lucide-react";

interface BondCardProps {
  bondAddress: string;
  userContractAddress?: string;
}

export function BondCard({ bondAddress, userContractAddress }: BondCardProps) {
  const { address } = useAccount();
  const { bondDetails, userAmount, isLoading } = useBondInfo(bondAddress);
  const { stake, isPending: isStaking } = useStake();
  const { withdraw, isPending: isWithdrawing } = useWithdraw();
  const { breakBond, isPending: isBreaking } = useBreakBond();
  
  const [stakeAmount, setStakeAmount] = useState("");
  const [showStakeForm, setShowStakeForm] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading bond details...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bondDetails) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-slate-500">
            Unable to load bond details
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("bond details....", bondDetails);
  console.log("user amount....", userAmount);
  console.log("address....", address);

  // Handle array structure from smart contract
  const bondData = Array.isArray(bondDetails) ? {
    asset: bondDetails[0],
    user1: bondDetails[1],
    user2: bondDetails[2],
    totalBondAmount: bondDetails[3],
    createdAt: bondDetails[4],
    isBroken: bondDetails[5],
    isWithdrawn: bondDetails[6],
    isActive: bondDetails[7],
    isFreezed: bondDetails[8]
  } : (bondDetails as any);

  console.log("is broken....", bondData.isBroken);

  const isActive = bondData.isActive && !bondData.isBroken && !bondData.isWithdrawn;
  const isPartner = bondData.user1 === userContractAddress || bondData.user2 === userContractAddress;
  console.log("Bond participants:", bondData.user1, bondData.user2);
  console.log("User contract address:", userContractAddress);
  console.log("Is partner:", isPartner);
  const userAmountEth = Number(userAmount) / 1e18;
  const totalAmountEth = Number(bondData.totalBondAmount) / 1e18;

  // Don't render the bond card if user is not a participant
  if (!isPartner) {
    return null;
  }

  const handleStake = async () => {
    if (!stakeAmount || !address) return;
    
    try {
      const amount = BigInt(parseFloat(stakeAmount) * 1e18);
      await stake(bondAddress, address, amount);
      setStakeAmount("");
      setShowStakeForm(false);
    } catch (error) {
      console.error("Error staking:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdraw(bondAddress);
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  const handleBreak = async () => {
    try {
      await breakBond(bondAddress);
    } catch (error) {
      console.error("Error breaking bond:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Bond {bondAddress.slice(0, 6)}...{bondAddress.slice(-4)}
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>
          Partner: {bondData.user1 === userContractAddress ? bondData.user2 : bondData.user1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Your Stake</div>
            <div className="font-semibold">{userAmountEth.toFixed(4)} ETH</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Total Amount</div>
            <div className="font-semibold">{totalAmountEth.toFixed(4)} ETH</div>
          </div>
        </div>

        {isPartner && isActive && (
          <div className="space-y-2">
            {!showStakeForm ? (
              <Button 
                onClick={() => setShowStakeForm(true)}
                className="w-full"
                variant="outline"
              >
                <Coins className="w-4 h-4 mr-2" />
                Stake ETH
              </Button>
            ) : (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Amount in ETH"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleStake}
                    disabled={isStaking || !stakeAmount}
                    className="flex-1"
                  >
                    {isStaking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Staking...
                      </>
                    ) : (
                      "Stake"
                    )}
                  </Button>
                  <Button 
                    onClick={() => setShowStakeForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleWithdraw}
                disabled={isWithdrawing || userAmountEth === 0}
                variant="outline"
                className="flex-1"
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Withdraw
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleBreak}
                disabled={isBreaking}
                variant="destructive"
                className="flex-1"
              >
                {isBreaking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Breaking...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Break Bond
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {!isPartner && (
          <div className="text-center text-slate-500 py-4">
            You are not a participant in this bond
          </div>
        )}
      </CardContent>
    </Card>
  );
}
