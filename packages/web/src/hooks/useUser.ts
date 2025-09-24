import { useReadContract } from "wagmi";
import { userAbi } from "@/lib/contracts";

export function useUser(userContractAddress?: string) {
  console.log("user contract address in useUser", userContractAddress);

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
  console.log("address in useUserBonds", address);
  console.log("abi in useUserBonds", abi);

  const read = useReadContract({
    abi,
    address,
    functionName: "getAllBonds",
    query: { enabled: !!address },
  });

  console.log("read in useUserBonds", read);


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
