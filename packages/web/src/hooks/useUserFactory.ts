import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { userFactoryAbi, getUserFactoryAddress } from "@/lib/contracts";

export function useUserFactory() {
  const { address } = useAccount();
  const contractAddress = getUserFactoryAddress();

  return {
    address: contractAddress,
    abi: userFactoryAbi,
  };
}

export function useHasUserContract(userAddress?: string) {
  const { address, abi } = useUserFactory();

  const read = useReadContract({
    abi,
    address,
    functionName: "hasUserContract",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: !!userAddress && !!address },
  });

  return read;
}

export function useGetUserContract(userAddress?: string) {
  const { address, abi } = useUserFactory();

  const read = useReadContract({
    abi,
    address,
    functionName: "getUserContract",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: { enabled: !!userAddress && !!address },
  });

  return read;
}

export function useCreateUser() {
  const { address, abi } = useUserFactory();
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createUser = (userAddress: string) => {
    writeContract({
      abi,
      address,
      functionName: "createUser",
      args: [userAddress as `0x${string}`],
    });
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createUser,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
