import { useAccount } from "wagmi";
import { useUserBonds } from "./useUser";
import { useBondDetails, useIndividualAmount, useIsUser } from "./useBond";
import { useMemo } from "react";

export interface BondInfo {
  address: string;
  details: unknown;
  userAmount: bigint;
  isUser: boolean;
}

export function useUserBondsInfo(userContractAddress?: string) {
  const { address } = useAccount();
  const { data: bondAddresses, isLoading: loadingBonds } = useUserBonds(userContractAddress);

  const bondsInfo = useMemo(() => {
    if (!bondAddresses || !address) return [];
    
    return bondAddresses.map((bondAddress: string) => ({
      address: bondAddress,
      // We'll fetch details for each bond separately
    }));
  }, [bondAddresses, address]);

  return {
    bondsInfo,
    isLoading: loadingBonds,
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
