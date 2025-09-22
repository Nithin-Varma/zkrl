"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useCallback, useState } from "react";
import { useCheckVerified } from "@/hooks/useCheckVerified";
import { useVerifyAadhaar, type AadhaarProof } from "@/hooks/useVerifyAadhaar";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";
import { useEffect } from "react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { address: contractAddress } = useIdentityRegistry();
  const [anonAadhaar] = useAnonAadhaar();

  useEffect(() => {
    console.log("Anon Aadhaar status: ", anonAadhaar.status);
    console.log(anonAadhaar);
  }, [anonAadhaar]);


  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">


        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ConnectButton />
          {isConnected && (
            <div className="flex flex-col gap-2 items-start">

              <LogInWithAnonAadhaar nullifierSeed={1234} />
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
