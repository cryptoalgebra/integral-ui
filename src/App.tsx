import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import "./styles/_colors.css";
import "./App.css";

import { WagmiConfig } from "wagmi";
import Layout from "@/components/common/Layout";

import BaseLogo from "@/assets/base-logo.jpg";
import { base } from "viem/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const chains = [base];
const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata: { name: "CLAMM DEX", description: "CLAMM DEX app", url: "https://app.clamm.io", icons: [""] },
});

createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    chainImages: {
        8453: BaseLogo,
    },
    defaultChain: base,
    themeVariables: {
        "--w3m-accent": "#ff8a34",
    },
    themeMode: "light",
});

function App({ children }: { children: React.ReactNode }) {
    return (
        <WagmiConfig config={wagmiConfig}>
            <Layout>{children}</Layout>
        </WagmiConfig>
    );
}

export default App;
