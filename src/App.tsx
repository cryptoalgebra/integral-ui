import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"
import { defineChain } from "viem"

import WBTCLogo from '@/assets/tokens/wbtc.svg'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const rootstockChain = defineChain({
  id: 30,
  network: 'rootstock',
  name: 'Rootstock',
  nativeCurrency: { name: 'RBTC', symbol: 'RBTC', decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_INFURA_RPC],
    },
    public: {
      http: [import.meta.env.VITE_INFURA_RPC],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'RootScan',
      url: 'https://explorer.rootstock.io',
    },
    default: {
      name: 'RootScan',
      url: 'https://explorer.rootstock.io',
    },
  },
})

const chains = [rootstockChain]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral', description: 'DEX Engine', url: 'https://integral.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  chainImages: {
    30: WBTCLogo
  },
  defaultChain: rootstockChain,
  themeVariables: {
    '--w3m-accent': '#2797ff'
  }
})

function App({ children }: { children: React.ReactNode }) {

  return (
    <WagmiConfig config={wagmiConfig}>
        <Layout>
          {children}
        </Layout>
    </WagmiConfig>
  )
}

export default App
