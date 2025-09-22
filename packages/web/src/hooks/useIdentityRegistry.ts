import { useMemo } from "react";
import type { Address } from "viem";
import { identityRegistryAbi } from "@/lib/contracts";
import { getIdentityRegistryConfig } from "@/lib/config";

export function useIdentityRegistry() {
  return useMemo(() => {
    try {
      const { address, chainId } = getIdentityRegistryConfig();
      return { address, chainId, abi: identityRegistryAbi as const };
    } catch (e) {
      return { address: undefined as unknown as Address, chainId: undefined, abi: identityRegistryAbi as const };
    }
  }, []);
}


