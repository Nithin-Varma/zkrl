import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { userAbi, getUserFactoryAddress, getBondFactoryAddress } from "@/lib/contracts";

export function useCreateUserBond(userContractAddress?: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const createBond = (partnerAddress: string) => {
    if (!userContractAddress) {
      throw new Error("User contract address is required");
    }

    const userFactoryAddress = getUserFactoryAddress();
    const bondFactoryAddress = getBondFactoryAddress();

    const result = writeContract({
      abi: userAbi,
      address: userContractAddress as `0x${string}`,
      functionName: "createBond",
      args: [
        partnerAddress as `0x${string}`,
        userFactoryAddress,
        bondFactoryAddress
      ],
    });
    console.log("result in useCreateUserBond", result);
    return result;
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    createBond,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}
