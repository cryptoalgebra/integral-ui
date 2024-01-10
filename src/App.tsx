import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"
import { defineChain } from 'viem'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const beraChainTestnet = defineChain({
  id: 2061,
  name: 'Berachain Testnet',
  network: 'berachain-testnet',
  nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.berachain-internal.com'],
    },
    public: {
      http: ['https://rpc.berachain-internal.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'beraExplorer',
      url: 'https://scan.berachain-internal.com/',
    },
  },
  testnet: true,
})

const chains = [beraChainTestnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Berachain x Algebra Integral', description: 'Berachain x Algebra', url: 'https://berachain.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains, 
  defaultChain: beraChainTestnet,
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
