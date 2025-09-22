"use client";

import { useMemo } from "react";
import {
  RainbowKitProvider,
  getDefaultConfig,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createStorage, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
} from "viem/chains";

type AppProvidersProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export function AppProviders({ children }: AppProvidersProps) {
  const config = useMemo(
    () =>
      getDefaultConfig({
        appName: "zkrl",
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
        ssr: true,
        chains: [
          mainnet,
          sepolia,
          base,
          baseSepolia,
          optimism,
          optimismSepolia,
          polygon,
          polygonAmoy,
        ],
        transports: {
          [mainnet.id]: http(),
          [sepolia.id]: http(),
          [base.id]: http(),
          [baseSepolia.id]: http(),
          [optimism.id]: http(),
          [optimismSepolia.id]: http(),
          [polygon.id]: http(),
          [polygonAmoy.id]: http(),
        },
        storage: createStorage({ storage: typeof window !== "undefined" ? window.localStorage : undefined }),
      }),
    []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{ lightMode: lightTheme(), darkMode: darkTheme() }}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}




