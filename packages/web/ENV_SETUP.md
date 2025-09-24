# Environment Variables Setup

Create a `.env.local` file in the `packages/web` directory with the following variables:

```bash
# Contract Addresses
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_USER_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_BOND_FACTORY_ADDRESS=0x0000000000000000000000000000000000000000
```

Replace the placeholder addresses with your actual deployed contract addresses.

## Required Contract Addresses:

1. **NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS**: Address of the deployed IdentityRegistry contract
2. **NEXT_PUBLIC_USER_FACTORY_ADDRESS**: Address of the deployed UserFactory contract  
3. **NEXT_PUBLIC_BOND_FACTORY_ADDRESS**: Address of the deployed BondFactory contract

## Example:

```bash
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_USER_FACTORY_ADDRESS=0x2345678901234567890123456789012345678901
NEXT_PUBLIC_BOND_FACTORY_ADDRESS=0x3456789012345678901234567890123456789012
```

After setting up the environment variables, restart your development server:

```bash
npm run dev
```
