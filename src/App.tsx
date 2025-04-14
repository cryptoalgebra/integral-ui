import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";
import "./styles/_colors.css";
import "./App.css";

import { Chain, WagmiConfig } from "wagmi";
import Layout from "@/components/common/Layout";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

const tac: Chain = {
    id: 2390,
    name: "TAC",
    network: "TAC",
    nativeCurrency: {
        decimals: 18,
        name: "TAC",
        symbol: "TAC",
    },
    rpcUrls: {
        default: { http: ["https://turin.rpc.tac.build/"] },
        public: { http: ["https://turin.rpc.tac.build/"] },
    },
    blockExplorers: {
        default: { name: "TAC Explorer", url: "https://turin.explorer.tac.build" },
    },
};

const chains = [tac];
const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata: { name: "Algebra Integral", description: "DEX Engine", url: "https://integral.algebra.finance", icons: [""] },
});

createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    chainImages: {
        2390: "https://avatars.githubusercontent.com/u/187664190?s=200&v=4",
    },
    defaultChain: tac,
    themeVariables: {
        "--w3m-accent": "#2797ff",
    },
});

function App({ children }: { children: React.ReactNode }) {
    return (
        <WagmiConfig config={wagmiConfig}>
            <Layout>{children}</Layout>
        </WagmiConfig>
    );
}

export default App;
