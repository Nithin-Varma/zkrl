"use client";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useCallback, useMemo, useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { identityRegistryAbi, getIdentityRegistryAddress } from "@/lib/contracts";
import type { Address } from "viem";

export default function Home() {
  const { address, isConnected } = useAccount();
  const contractAddress = useMemo<Address | undefined>(() => {
    try {
      return getIdentityRegistryAddress();
    } catch {
      return undefined;
    }
  }, []);

  const { data: isVerified, refetch, isFetching } = useReadContract({
    abi: identityRegistryAbi,
    address: contractAddress,
    functionName: "checkVerified",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!contractAddress },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [txError, setTxError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (!address || !contractAddress) return;
    setTxError(null);

    // TODO: Replace placeholders with proof values returned by Anon Aadhaar widget/SDK
    const placeholderIdentityHash = "0x" + "00".repeat(32);
    const placeholderHash = 0n;
    const placeholderAggregationId = 0n;
    const placeholderDomainId = 0n;
    const placeholderMerklePath: `0x${string}`[] = [];
    const placeholderLeafCount = 0n;
    const placeholderIndex = 0n;

    try {
      await writeContractAsync({
        abi: identityRegistryAbi,
        address: contractAddress,
        functionName: "verifyAadhar",
        args: [
          address,
          placeholderIdentityHash as `0x${string}`,
          placeholderHash,
          placeholderAggregationId,
          placeholderDomainId,
          placeholderMerklePath,
          placeholderLeafCount,
          placeholderIndex,
        ],
      });
      await refetch();
    } catch (err: any) {
      setTxError(err?.shortMessage || err?.message || "Transaction failed");
    }
  }, [address, contractAddress, writeContractAsync, refetch]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ConnectButton />
          {isConnected && (
            <div className="flex flex-col gap-2 items-start">
              {!contractAddress && (
                <p className="text-red-500 text-sm">Set NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS</p>
              )}
              {contractAddress && (
                <>
                  <p className="text-sm">
                    Status: {isFetching ? "checking..." : isVerified ? "Verified ✅" : "Not verified"}
                  </p>
                  {!isVerified && (
                    <button
                      className="rounded-md border border-foreground/20 px-4 py-2 text-sm hover:bg-foreground/10"
                      onClick={handleVerify}
                      disabled={isPending}
                    >
                      {isPending ? "Verifying..." : "Verify with Anon Aadhaar (placeholder)"}
                    </button>
                  )}
                  {txError && <p className="text-red-500 text-xs">{txError}</p>}
                </>
              )}
            </div>
          )}
         
         
        </div>
      </main>
    </div>
  );
}
