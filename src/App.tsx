import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import { defineChain } from 'viem'

import Layout from "@/components/common/Layout"
import ETHLogo from '@/assets/tokens/ether.svg'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const neuraTestnet = defineChain({
  id: 267,
  name: 'Neura Testnet',
  network: 'neura-testnet',
  nativeCurrency: { name: 'ANKR', symbol: 'ANKR', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://testnet.rpc.neuraprotocol.io'],
    },
    public: {
      http: ['https://testnet.rpc.neuraprotocol.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Neura Explorer',
      url: 'https://testnet-blockscout.infra.neuraprotocol.io/',
    },
  },
  testnet: true,
})

const chains = [neuraTestnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral', description: 'DEX Engine', url: 'https://integral.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  chainImages: {
    267: ETHLogo
  },
  defaultChain: neuraTestnet,
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
