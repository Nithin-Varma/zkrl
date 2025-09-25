import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { lenderFactoryAbi, getLenderFactoryAddress } from "@/lib/contracts";

export function useCreateLenderContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createLender = (interestRate: number) => {
    const factoryAddress = getLenderFactoryAddress();
    
    return writeContract({
      abi: lenderFactoryAbi,
      address: factoryAddress as `0x${string}`,
      functionName: "createLenderContract",
      args: [BigInt(interestRate * 100)], // Convert percentage to basis points
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createLender,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useLenderContract(lenderAddress?: string) {
  const { data: contractAddress, isLoading, error } = useReadContract({
    address: getLenderFactoryAddress() as `0x${string}`,
    abi: lenderFactoryAbi,
    functionName: "getLenderContract",
    args: lenderAddress ? [lenderAddress as `0x${string}`] : undefined,
  });

  return {
    contractAddress,
    isLoading,
    error,
  };
}

export function useHasLenderContract(lenderAddress?: string) {
  const { data: hasContract, isLoading, error } = useReadContract({
    address: getLenderFactoryAddress() as `0x${string}`,
    abi: lenderFactoryAbi,
    functionName: "hasLenderContract",
    args: lenderAddress ? [lenderAddress as `0x${string}`] : undefined,
  });

  return {
    hasContract,
    isLoading,
    error,
  };
}

export function useAllLenders() {
  const { data: lenders, isLoading, error } = useReadContract({
    address: getLenderFactoryAddress() as `0x${string}`,
    abi: lenderFactoryAbi,
    functionName: "getAllLenders",
  });

  return {
    lenders,
    isLoading,
    error,
  };
}
