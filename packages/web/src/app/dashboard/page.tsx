"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckVerified } from "@/hooks/useCheckVerified";
import { useUserInitialization } from "@/hooks/useUserInitialization";
import { useUserBondsInfo } from "@/hooks/useBonds";
import { useCreateUserBond } from "@/hooks/useUserBond";
import { useTrustScore } from "@/hooks/useTrustScore";
import { BondCard } from "@/components/BondCard";
import { TrustScoreDetails } from "@/components/TrustScoreDetails";
import { BorrowMoneyTab } from "@/components/BorrowMoneyTab";
import { LenderMode } from "@/components/LenderMode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Plus, ArrowRight, Star, DollarSign, CheckCircle, Loader2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { data: isVerified, isFetching } = useCheckVerified();
  
  // User initialization
  const { 
    userContractAddress, 
    userDetails, 
    isInitializing, 
    shouldCreateUser, 
    initializeUser,
    isLoading: userLoading 
  } = useUserInitialization();

  console.log("user contract address", userContractAddress);
  console.log("user details....", userDetails);
  
  // Bonds data
  const { bondsInfo, isLoading: bondsLoading } = useUserBondsInfo(userContractAddress || undefined);
  console.log("bonds info....", bondsInfo);

  console.log("bonds info", bondsInfo);
  
  // Trust score calculation
  const { 
    score: calculatedTrustScore, 
    isLoading: trustScoreLoading,
    bondScores,
    penalties
  } = useTrustScore(
    userContractAddress || undefined,
    userDetails as any,
    {
      w1: 0.3, // 30% for TVL
      w2: 0.2, // 20% for time
      w3: 0.5  // 50% for partner reputation
    }
  );
  
  // Bond creation
  const { createBond, isPending: isCreatingBond } = useCreateUserBond(userContractAddress || undefined);
  
  // State for creating new bond
  const [showCreateBond, setShowCreateBond] = useState(false);
  const [partnerAddress, setPartnerAddress] = useState("");
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"bonds" | "borrow" | "lender">("bonds");

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
    if (isConnected && !isFetching && !isVerified) {
      router.push('/verify');
    }
  }, [isConnected, isVerified, isFetching, router]);

  // Handle bond creation
  const handleCreateBond = async () => {
    if (!partnerAddress || !userContractAddress) return;
    
    try {
      await createBond(partnerAddress);
      setShowCreateBond(false);
      setPartnerAddress("");
    } catch (error) {
      console.error("Error creating bond:", error);
    }
  };

  if (!isConnected || isFetching || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
            <CardDescription className="text-center">
              {!isConnected ? "Please connect your wallet" : "Setting up your account..."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show user initialization if needed
  if (shouldCreateUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Initialize Your Account</CardTitle>
            <CardDescription className="text-center">
              Create your user contract to start using the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={initializeUser} 
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Identity Not Verified</CardTitle>
            <CardDescription className="text-center">
              Please complete your identity verification to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/verify')} className="w-full">
              Go to Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">zkRL</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Verified
            </Badge>
            <Button variant="outline" onClick={() => router.push('/')}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome to your zkRL Dashboard
          </h1>
          <p className="text-slate-600">
            Manage your reputation, trust bonds, and access to fair lending
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trustScoreLoading ? "Calculating..." : calculatedTrustScore.toFixed(2)}
              </div>
              <div className="flex items-center mt-2">
                <Progress value={trustScoreLoading ? 0 : Math.min(calculatedTrustScore * 10, 100)} className="flex-1 mr-2" />
                <span className="text-sm text-slate-500">
                  {trustScoreLoading ? "0" : Math.min(calculatedTrustScore * 10, 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on successful bonds and community trust
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bonds</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userDetails ? Number((userDetails as any).totalBonds) : 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active: {userDetails ? Number((userDetails as any).totalActiveBonds) : 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userDetails ? (Number((userDetails as any).totalAmount) / 1e18).toFixed(4) : "0.00"} ETH
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Across all your bonds
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={activeTab === "bonds" ? "default" : "outline"}
            onClick={() => setActiveTab("bonds")}
            className="flex-1"
          >
            <Shield className="w-4 h-4 mr-2" />
            My Bonds
          </Button>
          <Button
            variant={activeTab === "borrow" ? "default" : "outline"}
            onClick={() => setActiveTab("borrow")}
            className="flex-1"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Borrow Money
          </Button>
          <Button
            variant={activeTab === "lender" ? "default" : "outline"}
            onClick={() => setActiveTab("lender")}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Join as Lender
          </Button>
        </div>

        {activeTab === "bonds" ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trust Bonds Section */}
            <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Your Trust Bonds</h2>
              <Button onClick={() => setShowCreateBond(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Bond
              </Button>
            </div>

            {showCreateBond && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Bond</CardTitle>
                  <CardDescription>
                    Create a trust bond with another verified user
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Partner Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={partnerAddress}
                      onChange={(e) => setPartnerAddress(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateBond}
                      disabled={isCreatingBond || !partnerAddress}
                      className="flex-1"
                    >
                      {isCreatingBond ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Bond"
                      )}
                    </Button>
                    <Button 
                      onClick={() => setShowCreateBond(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {bondsLoading ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading bonds...
                    </div>
                  </CardContent>
                </Card>
              ) : bondsInfo.length === 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-slate-500">
                      No bonds found. Create your first bond to get started!
                    </div>
                  </CardContent>
                </Card>
              ) : (
                bondsInfo.map((bond: any) => (
                  <BondCard 
                    key={bond.address} 
                    bondAddress={bond.address} 
                    userContractAddress={userContractAddress || undefined}
                  />
                ))
              )}
            </div>
          </div>

          {/* User Info Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Account Information</h2>
            
            {/* Trust Score Details */}
            <TrustScoreDetails 
              score={calculatedTrustScore}
              isLoading={trustScoreLoading}
              penalties={penalties}
              bondScores={bondScores}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>User Contract Details</CardTitle>
                <CardDescription>
                  Your account information and contract address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">User Contract Address</div>
                  <div className="font-mono text-sm break-all">
                    {userContractAddress || "Not initialized"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Your Wallet</div>
                  <div className="font-mono text-sm break-all">
                    {address}
                  </div>
                </div>
                {userDetails && (userDetails as any) && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <div className="text-sm text-slate-500">Withdrawn Bonds</div>
                      <div className="font-semibold">{Number((userDetails as any).totalWithdrawnBonds)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500">Broken Bonds</div>
                      <div className="font-semibold">{Number((userDetails as any).totalBrokenBonds)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        ) : activeTab === "borrow" ? (
          <BorrowMoneyTab 
            userContractAddress={userContractAddress || undefined}
            bondsInfo={bondsInfo}
          />
        ) : (
          <LenderMode />
        )}
      </div>
    </div>
  );
}
