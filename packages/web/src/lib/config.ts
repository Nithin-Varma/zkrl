import type { Address } from "viem";

export type IdentityRegistryConfig = {
  address: Address;
  chainId?: number;
};

export function getIdentityRegistryConfig(): IdentityRegistryConfig {
  const address = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS as Address | undefined;
  const chainIdStr = process.env.NEXT_PUBLIC_CHAIN_ID;
  if (!address) throw new Error("Missing NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS");
  const chainId = chainIdStr ? Number(chainIdStr) : undefined;
  return { address, chainId };
}


