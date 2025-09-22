import { Address } from "viem";

export const identityRegistryAbi = [
  {
    type: "function",
    name: "checkVerified",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "verifyAadhar",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "identityHash", type: "bytes32" },
      { name: "_hash", type: "uint256" },
      { name: "_aggregationId", type: "uint256" },
      { name: "_domainId", type: "uint256" },
      { name: "_merklePath", type: "bytes32[]" },
      { name: "_leafCount", type: "uint256" },
      { name: "_index", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export function getIdentityRegistryAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS as Address | undefined;
  if (!addr) {
    throw new Error("Missing NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS");
  }
  return addr;
}


