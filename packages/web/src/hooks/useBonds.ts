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
  
  // Get all bonds from factory (to find bonds where user is participant)
  const { data: allBondAddresses, isLoading: loadingAllBonds } = useBondFactoryBonds();
  console.log("all bond addresses from factory", allBondAddresses);

  const bondsInfo = useMemo(() => {
    console.log("🔍 User Bond Addresses:", userBondAddresses);
    console.log("🔍 All Bond Addresses:", allBondAddresses);
    console.log("🔍 User Contract Address:", userContractAddress);
    
    if (!userContractAddress) return [];

    // Combine bonds from user contract and filter all bonds by participant
    const allBonds = new Set<string>();
    
    // Add bonds from user contract (bonds created by this user)
    if (userBondAddresses && Array.isArray(userBondAddresses)) {
      userBondAddresses.forEach((bondAddress: string) => allBonds.add(bondAddress));
    }
    
    // Add bonds from factory where user is a participant
    // Note: This is a workaround - ideally the smart contract should handle this
    if (allBondAddresses && Array.isArray(allBondAddresses)) {
      allBondAddresses.forEach((bondAddress: string) => {
        // We'll let the BondCard component filter by participant
        // This ensures we get all bonds where the user might be involved
        allBonds.add(bondAddress);
      });
    }
    
    return Array.from(allBonds).map((bondAddress: string) => ({
      address: bondAddress,
    }));
  }, [userBondAddresses, allBondAddresses, userContractAddress]);

  return {
    bondsInfo,
    isLoading: loadingUserBonds || loadingAllBonds,
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
