"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useCallback, useMemo, useState } from "react";
import { useCheckVerified } from "@/hooks/useCheckVerified";
import { useVerifyAadhaar } from "@/hooks/useVerifyAadhaar";
import { useIdentityRegistry } from "@/hooks/useIdentityRegistry";
import { LogInWithAnonAadhaar, useAnonAadhaar, AnonAadhaarProof, useProver } from "@anon-aadhaar/react";
import { useEffect } from "react";
import { keccak256, toBytes, parseAbiItem, encodeFunctionData } from "viem";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { address: contractAddress } = useIdentityRegistry();
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof ] = useProver();
  const { data: isVerified } = useCheckVerified();
  const { aggregate, buildContractArgs, verify } = useVerifyAadhaar();

  const [status, setStatus] = useState<string>("");
  const [agg, setAgg] = useState<any>(null);
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    console.log("Anon Aadhaar status: ", anonAadhaar.status);
    console.log(anonAadhaar);
  }, [anonAadhaar]);

  const computeInputsHash = useCallback(() => {
    if (!latestProof?.proof) return undefined as unknown as bigint;
    const values = [
      latestProof.proof.pubkeyHash,
      latestProof.proof.nullifier,
      latestProof.proof.timestamp,
      latestProof.proof.ageAbove18,
      latestProof.proof.gender,
      latestProof.proof.pincode,
      latestProof.proof.state,
      latestProof.proof.nullifierSeed,
      latestProof.proof.signalHash,
    ].map((v: any) => BigInt(v));
    const bytes = new Uint8Array(32 * values.length);
    for (let i = 0; i < values.length; i++) {
      let v = values[i];
      for (let j = 31; j >= 0; j--) {
        bytes[i * 32 + j] = Number(v & 0xffn);
        v >>= 8n;
      }
    }
    const hash = keccak256(bytes);
    return BigInt(hash);
  }, [latestProof]);

  const onAggregate = useCallback(async () => {
    if (!latestProof) return;
    setStatus("Submitting proof to zkVerify relayer...");
    const result = await aggregate(latestProof, setStatus);
    setAgg(result);
    setTxHash(result.txHash);
    setStatus("Aggregation complete.");
  }, [aggregate, latestProof]);

  const onVerify = useCallback(async () => {
    if (!address || !latestProof || !agg) return;
    const inputsHash = computeInputsHash();
    const domainId = 113n;
    const identityHash = toIdentityHash(address);
    const args = buildContractArgs({
      wallet: address,
      identityHash,
      inputsHash: inputsHash as unknown as bigint,
      aggregation: agg,
      domainId,
    });
    const receipt = await verify(args);
    console.log("verify tx: ", receipt);
  }, [address, latestProof, agg, computeInputsHash, buildContractArgs, verify]);

  function toIdentityHash(addr: `0x${string}`): `0x${string}` {
    const bytes = toBytes(addr);
    return keccak256(bytes) as `0x${string}`;
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <ConnectButton />
          {isConnected && (
            <>
            <div>
              <LogInWithAnonAadhaar nullifierSeed={1234} />
              <p>{anonAadhaar?.status}</p>
            </div>
            <div>
                {anonAadhaar?.status === "logged-in" && (
                  <>
                    <p>✅ Proof is valid</p>
                    {latestProof && (
                      <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
                    )}
                    <div className="flex gap-2 mt-2">
                      <button onClick={onAggregate} className="px-3 py-2 border rounded">Aggregate</button>
                      <button onClick={onVerify} className="px-3 py-2 border rounded" disabled={!agg}>Verify On-Chain</button>
                    </div>
                    {status && <p>{status}</p>}
                    {txHash && (
                      <a href={txHash} target="_blank" rel="noreferrer" className="underline">View zkVerify extrinsic</a>
                    )}
                  </>
                )}
              </div>
              </>
          )}
        </div>
      </main>
    </div>
  );
}
