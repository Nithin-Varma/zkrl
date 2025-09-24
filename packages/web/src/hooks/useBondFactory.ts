import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bondFactoryAbi, getBondFactoryAddress } from "@/lib/contracts";

export function useBondFactory() {
  const contractAddress = getBondFactoryAddress();

  return {
    address: contractAddress,
    abi: bondFactoryAbi,
  };
}

export function useAllBonds() {
  const { address, abi } = useBondFactory();

  const read = useReadContract({
    abi,
    address,
    functionName: "getAllBonds",
    query: { enabled: !!address },
  });

  return read;
}

export function useBondCount() {
  const { address, abi } = useBondFactory();

  const read = useReadContract({
    abi,
    address,
    functionName: "getBondCount",
    query: { enabled: !!address },
  });

  return read;
}

export function useCreateBond() {
  const { address, abi } = useBondFactory();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createBond = (asset: string, user1: string, user2: string) => {
    writeContract({
      abi,
      address,
      functionName: "createBond",
      args: [
        asset as `0x${string}`,
        user1 as `0x${string}`,
        user2 as `0x${string}`
      ],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  console.log("hash", hash);
  console.log("created bond result here......",createBond);

  return {
    createBond,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
