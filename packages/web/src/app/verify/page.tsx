"use client";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import { LogInWithAnonAadhaar, useAnonAadhaar, AnonAadhaarProof, useProver } from "@anon-aadhaar/react";
import { useVerifyAadhaar } from "@/hooks/useVerifyAadhaar";
import { useCheckVerified } from "@/hooks/useCheckVerified";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, CheckCircle, AlertCircle, Loader2, ArrowLeft, ExternalLink, LogOut, XCircle } from "lucide-react";
import { keccak256, toBytes } from "viem";
import { type AggregationResult } from "@/lib/zkverify";

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [anonAadhaar, startReq] = useAnonAadhaar();
  const [, latestProof] = useProver();
  const { data: isVerified, refetch } = useCheckVerified();
  const { aggregate, buildContractArgs, verify } = useVerifyAadhaar();

  const [status, setStatus] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [showAggregationSuccess, setShowAggregationSuccess] = useState(false);
  const [aggregationTxHash, setAggregationTxHash] = useState<string>("");
  const [onChainTxHash, setOnChainTxHash] = useState<string>("");
  const [showOnChainError, setShowOnChainError] = useState(false);
  const [onChainError, setOnChainError] = useState<string>("");

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
    if (isConnected && isVerified === true) {
      // User is already verified, redirect to dashboard
      router.push('/dashboard');
    }
  }, [isConnected, isVerified, router]);

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const handleAnonAadhaarLogout = () => {
    startReq({ type: 'logout' });
  };


  function toIdentityHash(addr: `0x${string}`): `0x${string}` {
    const bytes = toBytes(addr);
    return keccak256(bytes) as `0x${string}`;
  }

  const onVerify = useCallback(async () => {
    if (!address || !latestProof) return;
    
    try {
      setStatus("Submitting proof to zkVerify relayer...");
      setProgress(20);
      
      const result = await aggregate(latestProof, (status) => {
        setStatus(status);
        if (status.includes("Aggregated")) {
          setProgress(60);
        }
      });
      
      // Show aggregation success after result is available
      setAggregationTxHash(result.txHash);
      setShowAggregationSuccess(true);
      
      setStatus("Aggregation complete, submitting on-chain...");
      setProgress(80);
      
      const identityHash = toIdentityHash(address);
      const args = buildContractArgs({
        wallet: address,
        identityHash,
        aggregation: result as AggregationResult,
        domainId: 113
      });
      
      const receipt = await verify(args);
      setOnChainTxHash(receipt as string);
      setProgress(100);
      setStatus("On-chain verification complete!");
      setShowSuccess(true);
      
      // Wait for transaction to be mined and check verification status from smart contract
      setTimeout(async () => {
        try {
          // Refetch the verification status from the smart contract
          const { data: finalVerificationStatus } = await refetch();
          if (finalVerificationStatus) {
            // Show success and redirect to dashboard
            setStatus("✅ Verification successful! Redirecting to dashboard...");
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          } else {
            // Show error - verification failed on smart contract
            setShowOnChainError(true);
            setOnChainError("On-chain smart contract verification has failed");
            setStatus("❌ Verification failed on smart contract");
          }
        } catch (error) {
          setShowOnChainError(true);
          setOnChainError("Failed to check verification status");
          setStatus("❌ Error checking verification status");
        }
      }, 5000); // Wait 5 seconds for transaction to be mined
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setProgress(0);
      setShowOnChainError(true);
      setOnChainError(`Transaction failed: ${error.message}`);
    }
  }, [address, latestProof, buildContractArgs, verify, aggregate, refetch, router]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Wallet Not Connected</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to continue
            </CardDescription>
          </CardHeader>
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
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Button variant="outline" onClick={handleDisconnect}>
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Verify Your Identity
            </h1>
            <p className="text-xl text-slate-600">
              Complete your Anon Aadhaar verification to access zkRL's reputation-based lending
            </p>
          </div>

          {/* Verification Steps */}
          <div className="space-y-6">
            {/* Step 1: Anon Aadhaar Login */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Step 1: Anon Aadhaar Verification
                </CardTitle>
                <CardDescription>
                  Verify your identity using Anon Aadhaar. Your personal data never leaves your device.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {anonAadhaar?.status === "logged-out" && (
                  <div className="text-center py-8">
                    <LogInWithAnonAadhaar nullifierSeed={1234} />
                    <p className="text-sm text-slate-500 mt-4">
                      Click the button above to start the verification process
                    </p>
                  </div>
                )}

                {anonAadhaar?.status === "logging-in" && (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600">Processing your verification...</p>
                  </div>
                )}

                {anonAadhaar?.status === "logged-in" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Identity verified successfully!</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAnonAadhaarLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Re-verify
                      </Button>
                    </div>
                    
                    {latestProof && (
                      <div className="bg-slate-50 rounded-lg p-4">
                        <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: On-Chain Verification */}
            {anonAadhaar?.status === "logged-in" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Step 2: On-Chain Verification
                  </CardTitle>
                  <CardDescription>
                    Submit your proof to the blockchain to complete your zkRL registration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Smart Contract Verification Status */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Smart Contract Status:</span>
                        <div className="flex items-center">
                          {isVerified === true ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">Verified</span>
                            </div>
                          ) : isVerified === false ? (
                            <div className="flex items-center text-yellow-600">
                              <XCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">Not Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500">
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              <span className="text-sm font-medium">Checking...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Status from IdentityRegistry.checkVerified({address?.slice(0, 6)}...{address?.slice(-4)})
                      </p>
                    </div>

                    {status && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{status}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}

                    <Button 
                      onClick={onVerify} 
                      className="w-full"
                      disabled={!latestProof || status.includes("Error") || isVerified === true}
                    >
                      {isVerified === true ? "Already Verified" : status.includes("Error") ? "Try Again" : "Verify On-Chain"}
                    </Button>

                    {txHash && (
                      <div className="flex items-center justify-center">
                        <a 
                          href={txHash} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View zkVerify Transaction
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Privacy Notice */}
          <Card className="mt-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Shield className="w-5 h-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-blue-700 space-y-2 text-sm">
                <li>• Your Aadhaar data is processed locally and never stored on our servers</li>
                <li>• Only zero-knowledge proofs are submitted to the blockchain</li>
                <li>• Your personal information remains completely private</li>
                <li>• Verification is required only once per wallet address</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aggregation Success Dialog */}
      <AlertDialog open={showAggregationSuccess} onOpenChange={setShowAggregationSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-blue-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              Aggregation Complete!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your proof has been successfully aggregated on zkVerify. 
              You can view the transaction details on the explorer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end space-x-2">
            {aggregationTxHash && (
              <Button variant="outline" asChild>
                <a href={aggregationTxHash} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on zkVerify Explorer
                </a>
              </Button>
            )}
            <Button onClick={() => setShowAggregationSuccess(false)}>
              Continue
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              Verification Complete!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your identity has been successfully verified and registered on zkRL. 
              You can now access the dashboard to start building your reputation and accessing loans.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end space-x-2">
            {onChainTxHash && (
              <Button variant="outline" asChild>
                <a href={`https://horizen-explorer-testnet.appchain.base.org/tx/${onChainTxHash}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Horizon Explorer
                </a>
              </Button>
            )}
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* On-Chain Error Dialog */}
      <AlertDialog open={showOnChainError} onOpenChange={setShowOnChainError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <XCircle className="w-6 h-6 mr-2" />
              On-Chain Verification Failed
            </AlertDialogTitle>
            <AlertDialogDescription>
              {onChainError}. The transaction was submitted but the smart contract verification failed. 
              You can view the transaction details on the explorer to see what went wrong.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end space-x-2">
            {onChainTxHash && (
              <Button variant="outline" asChild>
                <a href={`https://horizen-explorer-testnet.appchain.base.org/tx/${onChainTxHash}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Failed Transaction
                </a>
              </Button>
            )}
            <Button onClick={() => setShowOnChainError(false)}>
              Try Again
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
