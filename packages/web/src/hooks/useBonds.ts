import { useAccount } from "wagmi";
import { useUserBonds } from "./useUser";
import { useAllBonds as useBondFactoryBonds } from "./useBondFactory";
import { useBondDetails, useIndividualAmount, useIsUser } from "./useBond";
import { useMemo } from "react";

export interface BondInfo {
  address: string;
  details: unknown;
  userAmount: bigint;
  isUser: boolean;
}

export function useUserBondsInfo(userContractAddress?: string) {
  console.log("user contract address in useBonds-useUserBondsInfo", userContractAddress);
  const { address } = useAccount();
  console.log("address in useBonds-useUserBondsInfo", address);
  
  // Get bonds from user contract (creator's bonds)
  const { data: userBondAddresses, isLoading: loadingUserBonds } = useUserBonds(userContractAddress);
  console.log("bond addresses from user contract", userBondAddresses);

  const bondsInfo = useMemo(() => {
    console.log("🔍 User Bond Addresses:", userBondAddresses);
    console.log("🔍 User Contract Address:", userContractAddress);
    
    if (!userContractAddress || !userBondAddresses) {
      console.log("❌ No user contract or bond addresses found");
      return [];
    }

    // Only return bonds from user contract (bonds created by this user)
    if (Array.isArray(userBondAddresses)) {
      console.log("✅ Found", userBondAddresses.length, "bonds for user");
      return userBondAddresses.map((bondAddress: string) => ({
        address: bondAddress,
      }));
    }
    
    console.log("❌ No valid bonds found");
    return [];
  }, [userBondAddresses, userContractAddress]);

  return {
    bondsInfo,
    isLoading: loadingUserBonds,
  };
}

export function useBondInfo(bondAddress: string) {
  const { address } = useAccount();
  
  const { data: bondDetails, isLoading: loadingDetails } = useBondDetails(bondAddress);
  const { data: userAmount, isLoading: loadingAmount } = useIndividualAmount(bondAddress, address);
  const { data: isUser, isLoading: loadingIsUser } = useIsUser(bondAddress, address);

  return {
    bondDetails,
    userAmount: userAmount || 0n,
    isUser: isUser || false,
    isLoading: loadingDetails || loadingAmount || loadingIsUser,
  };
}
