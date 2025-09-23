"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCheckVerified } from "@/hooks/useCheckVerified";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: isVerified, isFetching } = useCheckVerified();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && !isFetching) {
      if (isVerified) {
        router.push('/dashboard');
      } else {
        router.push('/verify');
      }
    }
  }, [isConnected, isVerified, isFetching, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">zkRL</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Zero-Knowledge Reputation Lending
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Lend with <span className="text-blue-600">Trust</span>,<br />
            Not Collateral
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Break free from over-collateralized lending. Use your verified identity and reputation 
            as collateral to access fair, trust-based loans on the blockchain.
          </p>

          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div> */}
        </div>

        {/* Problem & Solution Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                The Problem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Traditional DeFi lending requires 150-300% collateralization, locking up massive amounts 
                of capital and limiting access to credit for those who need it most.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Our Solution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">
                zkRL uses zero-knowledge proofs to verify your identity and reputation on-chain, 
                creating "trust bonds" that serve as collateral for fair, accessible loans.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">How zkRL Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>1. Verify Identity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Use Anon Aadhaar to prove your identity without revealing personal data. 
                  Your verification is stored as a zero-knowledge proof.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>2. Build Reputation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Create trust bonds with other verified users. Your reputation score grows 
                  through successful transactions and community interactions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>3. Access Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Use your reputation as collateral to access loans at fair rates. 
                  No over-collateralization required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Why Choose zkRL?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Privacy First</h3>
              <p className="text-sm text-slate-600">Your identity data never leaves your device</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Fair Rates</h3>
              <p className="text-sm text-slate-600">No over-collateralization required</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Community Driven</h3>
              <p className="text-sm text-slate-600">Build trust through community interactions</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Instant Access</h3>
              <p className="text-sm text-slate-600">Get verified and start lending immediately</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
