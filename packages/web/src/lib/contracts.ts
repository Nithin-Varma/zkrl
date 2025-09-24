import { Address } from "viem";
import identityRegistryOut from "../../../../packages/contracts/out/IdentityRegister.sol/IdentityRegistry.json" assert { type: "json" };
import userFactoryOut from "../../../../packages/contracts/out/UserFactory.sol/UserFactory.json" assert { type: "json" };
import bondFactoryOut from "../../../../packages/contracts/out/BondFactory.sol/BondFactory.json" assert { type: "json" };
import userOut from "../../../../packages/contracts/out/User.sol/User.json" assert { type: "json" };
import bondOut from "../../../../packages/contracts/out/Bond.sol/Bond.json" assert { type: "json" };

export const identityRegistryAbi = (identityRegistryOut as any).abi ?? [
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
      { name: "_leaf", type: "bytes32" },
      { name: "_aggregationId", type: "uint256" },
      { name: "_domainId", type: "uint256" },
      { name: "_merklePath", type: "bytes32[]" },
      { name: "_leafCount", type: "uint256" },
      { name: "_index", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const userFactoryAbi = (userFactoryOut as any).abi ?? [
  {
    type: "function",
    name: "createUser",
    stateMutability: "nonpayable",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "hasUserContract",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getUserContract",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export const bondFactoryAbi = (bondFactoryOut as any).abi ?? [
  {
    type: "function",
    name: "createBond",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "user1", type: "address" },
      { name: "user2", type: "address" }
    ],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "getAllBonds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "getBondCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const userAbi = (userOut as any).abi ?? [
  {
    type: "function",
    name: "getUserDetails",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "userAddress", type: "address" },
          { name: "trustScore", type: "uint256" },
          { name: "totalBonds", type: "uint256" },
          { name: "totalAmount", type: "uint256" },
          { name: "totalWithdrawnBonds", type: "uint256" },
          { name: "totalBrokenBonds", type: "uint256" },
          { name: "totalActiveBonds", type: "uint256" },
          { name: "totalWithdrawnAmount", type: "uint256" },
          { name: "totalBrokenAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" }
        ]
      }
    ],
  },
  {
    type: "function",
    name: "getAllBonds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    type: "function",
    name: "getBondCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "createBond",
    stateMutability: "nonpayable",
    inputs: [
      { name: "partner", type: "address" },
      { name: "userFactory", type: "address" },
      { name: "bondFactory", type: "address" }
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "addBond",
    stateMutability: "nonpayable",
    inputs: [
      { name: "bondAddress", type: "address" }
    ],
    outputs: [],
  },
] as const;

export const bondAbi = (bondOut as any).abi ?? [
  {
    type: "function",
    name: "bond",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "asset", type: "address" },
          { name: "user1", type: "address" },
          { name: "user2", type: "address" },
          { name: "totalBondAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isBroken", type: "bool" },
          { name: "isWithdrawn", type: "bool" },
          { name: "isActive", type: "bool" },
          { name: "isFreezed", type: "bool" }
        ]
      }
    ],
  },
  {
    type: "function",
    name: "stake",
    stateMutability: "payable",
    inputs: [
      { name: "user", type: "address" },
      { name: "_amount", type: "uint256" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "asset", type: "address" },
          { name: "user1", type: "address" },
          { name: "user2", type: "address" },
          { name: "totalBondAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isBroken", type: "bool" },
          { name: "isWithdrawn", type: "bool" },
          { name: "isActive", type: "bool" },
          { name: "isFreezed", type: "bool" }
        ]
      }
    ],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "asset", type: "address" },
          { name: "user1", type: "address" },
          { name: "user2", type: "address" },
          { name: "totalBondAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isBroken", type: "bool" },
          { name: "isWithdrawn", type: "bool" },
          { name: "isActive", type: "bool" },
          { name: "isFreezed", type: "bool" }
        ]
      }
    ],
  },
  {
    type: "function",
    name: "breakBond",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "asset", type: "address" },
          { name: "user1", type: "address" },
          { name: "user2", type: "address" },
          { name: "totalBondAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isBroken", type: "bool" },
          { name: "isWithdrawn", type: "bool" },
          { name: "isActive", type: "bool" },
          { name: "isFreezed", type: "bool" }
        ]
      }
    ],
  },
  {
    type: "function",
    name: "bond",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "asset", type: "address" },
          { name: "user1", type: "address" },
          { name: "user2", type: "address" },
          { name: "totalBondAmount", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "isBroken", type: "bool" },
          { name: "isWithdrawn", type: "bool" },
          { name: "isActive", type: "bool" },
          { name: "isFreezed", type: "bool" }
        ]
      }
    ],
  },
  {
    type: "function",
    name: "individualAmount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isUser",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export function getIdentityRegistryAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS as Address | undefined;
  if (!addr) {
    throw new Error("Missing NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS");
  }
  return addr;
}

export function getUserFactoryAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_USER_FACTORY_ADDRESS as Address | undefined;
  if (!addr) {
    throw new Error("Missing NEXT_PUBLIC_USER_FACTORY_ADDRESS");
  }
  return addr;
}

export function getBondFactoryAddress(): Address {
  const addr = process.env.NEXT_PUBLIC_BOND_FACTORY_ADDRESS as Address | undefined;
  if (!addr) {
    throw new Error("Missing NEXT_PUBLIC_BOND_FACTORY_ADDRESS");
  }
  return addr;
}


