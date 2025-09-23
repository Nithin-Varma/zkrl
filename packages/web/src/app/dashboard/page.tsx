"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckVerified } from "@/hooks/useCheckVerified";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, Users, Plus, Eye, ArrowRight, Star, DollarSign, Clock, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { data: isVerified, isFetching } = useCheckVerified();

  // Mock data - in a real app, this would come from smart contracts
  const [reputationScore] = useState(750);
  const [maxLoanAmount] = useState(5000);
  const [activeTrustBonds] = useState([
    {
      id: 1,
      partner: "0x742d...8a3f",
      amount: 1000,
      status: "active",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      partner: "0x9b1c...4e7d",
      amount: 2500,
      status: "active",
      createdAt: "2024-01-20"
    }
  ]);
  const [recentTransactions] = useState([
    {
      id: 1,
      type: "trust_bond_created",
      amount: 1000,
      partner: "0x742d...8a3f",
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      type: "reputation_earned",
      amount: 50,
      description: "Successful loan repayment",
      timestamp: "2024-01-14T15:45:00Z"
    }
  ]);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
    if (isConnected && !isFetching && !isVerified) {
      router.push('/verify');
    }
  }, [isConnected, isVerified, isFetching, router]);

  if (!isConnected || isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Loading...</CardTitle>
            <CardDescription className="text-center">
              {!isConnected ? "Please connect your wallet" : "Verifying your identity..."}
            </CardDescription>
          </CardHeader>
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
              <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reputationScore}</div>
              <div className="flex items-center mt-2">
                <Progress value={75} className="flex-1 mr-2" />
                <span className="text-sm text-slate-500">75%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on successful transactions and community trust
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Loan Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${maxLoanAmount.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">
                Based on your reputation score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trust Bonds</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTrustBonds.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                Total value: ${activeTrustBonds.reduce((sum, bond) => sum + bond.amount, 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trust Bonds Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Your Trust Bonds</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Bond
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Bonds</CardTitle>
                <CardDescription>
                  Trust bonds you've created with other verified users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTrustBonds.map((bond) => (
                    <div key={bond.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Partner: {bond.partner}</div>
                        <div className="text-sm text-slate-500">Amount: ${bond.amount.toLocaleString()}</div>
                        <div className="text-sm text-slate-500">Created: {bond.createdAt}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {bond.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your recent reputation and trust bond activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {tx.type === "trust_bond_created" ? (
                            <Users className="w-4 h-4 text-blue-600" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {tx.type === "trust_bond_created" ? "Trust Bond Created" : "Reputation Earned"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {tx.partner && `With ${tx.partner}`}
                            {tx.description && tx.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {tx.type === "trust_bond_created" ? `$${tx.amount.toLocaleString()}` : `+${tx.amount} pts`}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-blue-600" />
                  Create Trust Bond
                </CardTitle>
                <CardDescription>
                  Establish a trust relationship with another verified user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Bonding
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Request Loan
                </CardTitle>
                <CardDescription>
                  Apply for a loan using your reputation as collateral
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Find Partners
                </CardTitle>
                <CardDescription>
                  Discover other verified users to create trust bonds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
