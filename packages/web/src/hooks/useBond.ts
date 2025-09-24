import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { bondAbi } from "@/lib/contracts";

export function useBond(bondContractAddress?: string) {
  return {
    address: bondContractAddress as `0x${string}` | undefined,
    abi: bondAbi,
  };
}

export function useBondDetails(bondContractAddress?: string) {
  const { address, abi } = useBond(bondContractAddress);

  const read = useReadContract({
    abi,
    address,
    functionName: "bond",
    query: { enabled: !!address },
  });

  return read;
}

export function useIndividualAmount(bondContractAddress?: string, userAddress?: string) {
  const { address, abi } = useBond(bondContractAddress);

  const read = useReadContract({
    abi,
    address,
    functionName: "individualAmount",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: !!address && !!userAddress },
  });

  return read;
}

export function useIsUser(bondContractAddress?: string, userAddress?: string) {
  const { address, abi } = useBond(bondContractAddress);

  const read = useReadContract({
    abi,
    address,
    functionName: "isUser",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: !!address && !!userAddress },
  });

  return read;
}

export function useStake() {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const stake = (bondAddress: string, userAddress: string, amount: bigint) => {
    writeContract({
      abi: bondAbi,
      address: bondAddress as `0x${string}`,
      functionName: "stake",
      args: [userAddress as `0x${string}`, amount],
      value: amount,
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    stake,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const withdraw = (bondAddress: string) => {
    writeContract({
      abi: bondAbi,
      address: bondAddress as `0x${string}`,
      functionName: "withdraw",
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    withdraw,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useBreakBond() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const breakBond = (bondAddress: string) => {
    writeContract({
      abi: bondAbi,
      address: bondAddress as `0x${string}`,
      functionName: "breakBond",
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    breakBond,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
