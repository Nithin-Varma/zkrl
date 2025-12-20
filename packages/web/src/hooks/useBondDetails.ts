import { useMemo } from "react";
import { useBondDetails, useIndividualAmount, useIsUser } from "./useBond";
import { useAccount } from "wagmi";

export interface BondDetailInfo {
  address: string;
  totalBondAmount: bigint;
  individualAmount: bigint;
  isUser: boolean;
  isActive: boolean;
  user1: string;
  user2: string;
  partner: string;
}

export function useBondDetailInfo(bondAddress: string) {
  const { address } = useAccount();
  
  // Get bond details
  const { data: bondDetails, isLoading: loadingDetails } = useBondDetails(bondAddress);
  const { data: individualAmount, isLoading: loadingAmount } = useIndividualAmount(bondAddress, address);
  const { data: isUser, isLoading: loadingIsUser } = useIsUser(bondAddress, address);

  const bondInfo = useMemo(() => {
    if (!bondDetails || !address) {
      console.log("🔍 Bond Details - No data:", { bondDetails, address });
      return null;
    }

    console.log("🔍 Raw Bond Details:", bondDetails);
    console.log("🔍 Bond Details type:", typeof bondDetails);
    console.log("🔍 Bond Details is array:", Array.isArray(bondDetails));

    // Extract bond data from the tuple - the structure is:
    // [asset, user1, user2, totalBondAmount, createdAt, isBroken, isWithdrawn, isActive, isFreezed]
    let totalBondAmount, user1, user2, isActive, isBroken, isWithdrawn;
    
    if (Array.isArray(bondDetails)) {
      // Handle array format: [asset, user1, user2, totalBondAmount, createdAt, isBroken, isWithdrawn, isActive, isFreezed]
      totalBondAmount = bondDetails[3] || 0n;
      user1 = bondDetails[1] || "";
      user2 = bondDetails[2] || "";
      isActive = bondDetails[7] || false;
      isBroken = bondDetails[5] || false;
      isWithdrawn = bondDetails[6] || false;
      console.log("🔍 Array format - totalBondAmount:", totalBondAmount);
    } else {
      // Handle object format
      const bond = bondDetails as any;
      totalBondAmount = bond.totalBondAmount || 0n;
      user1 = bond.user1 || "";
      user2 = bond.user2 || "";
      isActive = bond.isActive || false;
      isBroken = bond.isBroken || false;
      isWithdrawn = bond.isWithdrawn || false;
      console.log("🔍 Object format - totalBondAmount:", totalBondAmount);
    }
    
    // Determine partner (the other user in the bond)
    const partner = user1.toLowerCase() === address.toLowerCase() ? user2 : user1;
    
    // Check if bond is truly active (has funds, both users set, not broken, not withdrawn)
    const isBondActive = isActive && !isBroken && !isWithdrawn && totalBondAmount > 0n && user1 !== "" && user2 !== "";

    console.log("🔍 Bond Details Debug:", {
      address: bondAddress,
      totalBondAmount: totalBondAmount.toString(),
      user1,
      user2,
      isActive,
      isBroken,
      isWithdrawn,
      isBondActive,
      partner,
      individualAmount: individualAmount?.toString() || "0"
    });

    return {
      address: bondAddress,
      totalBondAmount,
      individualAmount: individualAmount || 0n,
      isUser: isUser || false,
      isActive: isBondActive,
      user1,
      user2,
      partner
    } as BondDetailInfo;
  }, [bondDetails, individualAmount, isUser, address, bondAddress]);

  return {
    bondInfo,
    isLoading: loadingDetails || loadingAmount || loadingIsUser,
  };
}

export function useUserBondsWithDetails(bondAddresses: string[]) {
  // We can't call hooks in a loop, so we'll return a simplified version
  // that just uses the bond addresses without detailed info for now
  const bondsWithDetails = useMemo(() => {
    console.log("🔍 useUserBondsWithDetails - bondAddresses:", bondAddresses);
    
    if (!bondAddresses || bondAddresses.length === 0) {
      return [];
    }

    // For now, return basic bond info without detailed amounts
    // The individual BondAmountDisplay components will fetch their own details
    return bondAddresses.map((address, index) => ({
      address,
      totalBondAmount: 0n, // Will be fetched by individual components
      individualAmount: 0n,
      isUser: true,
      isActive: true, // Assume active for now
      user1: "",
      user2: "",
      partner: ""
    }));
  }, [bondAddresses]);

  return {
    bondsWithDetails,
    isLoading: false, // No loading since we're not fetching details here
  };
}
