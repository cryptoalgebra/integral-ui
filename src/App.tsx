import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"
import { defineChain } from "viem"

const projectId = 'f370559ba7976e89ed93819ecdc03c64'

const goerliChain = defineChain({
  id: 5,
  network: 'goerli',
  name: 'Goerli',
  nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://goerli.infura.io/v3/5c55489ae3414b8b9a1a328b577f89bb'],
    },
    public: {
      http: ['https://goerli.infura.io/v3/5c55489ae3414b8b9a1a328b577f89bb'],
    },
  },
  blockExplorers: {
    etherscan: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
    },
    default: {
      name: 'Etherscan',
      url: 'https://goerli.etherscan.io',
    },
  },
  contracts: {
    ensRegistry: {
      address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    },
    ensUniversalResolver: {
      address: '0x56522D00C410a43BFfDF00a9A569489297385790',
      blockCreated: 8765204,
    },
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 6507670,
    },
  },
  testnet: true,
}) 

const chains = [goerliChain]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral' } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains, 
  chainImages: {
    5: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  defaultChain: goerliChain,
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
