import { useAccount, useReadContract } from "wagmi";
import { useIdentityRegistry } from "./useIdentityRegistry";

export function useCheckVerified() {
  const { address, isConnected } = useAccount();
  const { address: contractAddress, abi } = useIdentityRegistry();

  const read = useReadContract({
    abi,
    address: contractAddress,
    functionName: "checkVerified",
    args: address ? [address] : undefined,
    query: { enabled: isConnected && !!address && !!contractAddress },
  });

  return read;
}


