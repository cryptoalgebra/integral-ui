import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import { defineChain } from 'viem'

import Layout from "@/components/common/Layout"
import ETHLogo from '@/assets/tokens/ether.svg'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const hyperEvmMainnet = defineChain({
  id: 999,
  name: 'HyperEVM',
  network: 'hyper-evm-mainnet',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperlend.finance'],
    },
    public: {
      http: ['https://rpc.hyperlend.finance'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyper Scan',
      url: 'https://www.hyperscan.com/',
    },
  },
  testnet: true,
})

const chains = [hyperEvmMainnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral', description: 'DEX Engine', url: 'https://integral.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  chainImages: {
    999: ETHLogo
  },
  defaultChain: hyperEvmMainnet,
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
