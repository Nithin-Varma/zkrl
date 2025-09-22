import { useWriteContract } from "wagmi";
import { useIdentityRegistry } from "./useIdentityRegistry";

export type AadhaarProof = {
  wallet: `0x${string}`;
  identityHash: `0x${string}`;
  hash: bigint;
  aggregationId: bigint;
  domainId: bigint;
  merklePath: `0x${string}`[];
  leafCount: bigint;
  index: bigint;
};

export function useVerifyAadhaar() {
  const { address: contractAddress, abi } = useIdentityRegistry();
  const write = useWriteContract();

  async function verify(proof: AadhaarProof) {
    if (!contractAddress) throw new Error("IdentityRegistry address missing");
    return write.writeContractAsync({
      abi,
      address: contractAddress,
      functionName: "verifyAadhar",
      args: [
        proof.wallet,
        proof.identityHash,
        proof.hash,
        proof.aggregationId,
        proof.domainId,
        proof.merklePath,
        proof.leafCount,
        proof.index,
      ],
    });
  }

  return { ...write, verify };
}


