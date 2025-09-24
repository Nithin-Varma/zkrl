import { useReadContract } from "wagmi";
import { userAbi } from "@/lib/contracts";

export function useUser(userContractAddress?: string) {
  return {
    address: userContractAddress as `0x${string}` | undefined,
    abi: userAbi,
  };
}

export function useUserDetails(userContractAddress?: string) {
  const { address, abi } = useUser(userContractAddress);

  const read = useReadContract({
    abi,
    address,
    functionName: "getUserDetails",
    query: { enabled: !!address },
  });

  return read;
}

export function useUserBonds(userContractAddress?: string) {
  const { address, abi } = useUser(userContractAddress);

  const read = useReadContract({
    abi,
    address,
    functionName: "getAllBonds",
    query: { enabled: !!address },
  });

  return read;
}

export function useUserBondCount(userContractAddress?: string) {
  const { address, abi } = useUser(userContractAddress);

  const read = useReadContract({
    abi,
    address,
    functionName: "getBondCount",
    query: { enabled: !!address },
  });

  return read;
}
