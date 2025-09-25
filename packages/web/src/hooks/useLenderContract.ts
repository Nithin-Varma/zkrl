import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { lenderAbi } from "@/lib/contracts";

export function useAddFunds(lenderContractAddress?: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const addFunds = (amount: bigint) => {
    if (!lenderContractAddress) return;
    
    return writeContract({
      abi: lenderAbi,
      address: lenderContractAddress as `0x${string}`,
      functionName: "addFunds",
      value: amount,
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    addFunds,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useSetInterestRate(lenderContractAddress?: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const setInterestRate = (rate: number) => {
    if (!lenderContractAddress) return;
    
    return writeContract({
      abi: lenderAbi,
      address: lenderContractAddress as `0x${string}`,
      functionName: "setInterestRate",
      args: [BigInt(rate)],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    setInterestRate,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useWithdrawFunds(lenderContractAddress?: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const withdrawFunds = (amount: bigint) => {
    if (!lenderContractAddress) return;
    
    return writeContract({
      abi: lenderAbi,
      address: lenderContractAddress as `0x${string}`,
      functionName: "withdrawFunds",
      args: [amount],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    withdrawFunds,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useVerifyAndLend(lenderContractAddress?: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const verifyAndLend = (
    borrower: string,
    amount: bigint,
    duration: number,
    collateralBonds: string[],
    proof: string
  ) => {
    if (!lenderContractAddress) return;
    
    return writeContract({
      abi: lenderAbi,
      address: lenderContractAddress as `0x${string}`,
      functionName: "verifyAndLend",
      args: [
        borrower as `0x${string}`,
        amount,
        BigInt(duration),
        collateralBonds as `0x${string}`[],
        proof as `0x${string}`
      ],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    verifyAndLend,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useLenderContractInfo(lenderContractAddress?: string) {
  const { data: interestRate, isLoading: rateLoading } = useReadContract({
    address: lenderContractAddress as `0x${string}`,
    abi: lenderAbi,
    functionName: "interestRate",
  });

  const { data: totalFunds, isLoading: fundsLoading } = useReadContract({
    address: lenderContractAddress as `0x${string}`,
    abi: lenderAbi,
    functionName: "totalFunds",
  });

  const { data: availableFunds, isLoading: availableLoading } = useReadContract({
    address: lenderContractAddress as `0x${string}`,
    abi: lenderAbi,
    functionName: "availableFunds",
  });

  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: lenderContractAddress as `0x${string}`,
    abi: lenderAbi,
    functionName: "getBalance",
  });

  return {
    interestRate,
    totalFunds,
    availableFunds,
    balance,
    isLoading: rateLoading || fundsLoading || availableLoading || balanceLoading,
  };
}
