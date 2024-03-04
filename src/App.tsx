import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"
import { defineChain } from "viem"

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const holeskyChain = defineChain({
  id: 17000,
  network: 'holesky',
  name: 'Holesky',
  nativeCurrency: { name: 'Holesky Ether', symbol: 'ETH', decimals: 18 },
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
      name: 'Etherscan',
      url: 'https://holesky.etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://holesky.etherscan.io',
    },
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 77,
    },
  },
  testnet: true,
}) 

const chains = [holeskyChain]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral', description: 'DEX engine', url: 'https://integral.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains, 
  chainImages: {
    17000: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  defaultChain: holeskyChain,
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
