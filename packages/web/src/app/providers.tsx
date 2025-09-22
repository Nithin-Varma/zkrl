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
import { defineChain } from "viem";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

type AppProvidersProps = {
  children: React.ReactNode;
};

const queryClient = new QueryClient();

export function AppProviders({ children }: AppProvidersProps) {
  const config = useMemo(() => {
    const horizonTestnet = defineChain({
      id: 845320009,
      name: "horizonTestnet",
      network: "horizonTestnet",
      nativeCurrency: { decimals: 18, name: "ETH", symbol: "ETH" },
      rpcUrls: { default: { http: ["https://horizen-rpc-testnet.appchain.base.org"] } },
      blockExplorers: {
        default: { name: "Explorer", url: "https://horizen-explorer-testnet.appchain.base.org/" },
      },
    });
    return getDefaultConfig({
      appName: "zkrl",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
      ssr: true,
      chains: [horizonTestnet],
      transports: {
        [horizonTestnet.id]: http("https://horizen-rpc-testnet.appchain.base.org"),
      },
      storage: createStorage({ storage: typeof window !== "undefined" ? window.localStorage : undefined }),
    });
  }, []);

  return (
    <AnonAadhaarProvider _useTestAadhaar={true}>
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
    </AnonAadhaarProvider>
  );
}