# Vercel Deployment Configuration

Since this is a monorepo, configure these settings in the **Vercel Dashboard**:

## Project Settings

1. Go to your project settings in Vercel
2. Navigate to "Build & Development Settings"
3. Configure the following:

### Root Directory
```
packages/web
```

### Build Command
```
pnpm run build
```

### Output Directory
```
.next
```

### Install Command
```
pnpm install
```

### Framework Preset
```
Next.js
```

## Environment Variables

Make sure to add these in the Vercel Dashboard under "Environment Variables":

- `NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS`
- `NEXT_PUBLIC_USER_FACTORY_ADDRESS`
- `NEXT_PUBLIC_BOND_FACTORY_ADDRESS`
- `NEXT_PUBLIC_LENDER_FACTORY_ADDRESS`

## Notes

- The Root Directory setting tells Vercel to treat `packages/web` as the project root
- All paths (build command, output directory) are relative to the root directory
- This avoids issues with monorepo setups where the Next.js app is in a subdirectory
