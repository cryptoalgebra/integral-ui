import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"

import ETHLogo from '@/assets/tokens/ether.svg'
import { defineChain } from 'viem'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const sonicBlazeTestnet = defineChain({
  id: 57054,
  name: 'Sonic Blaze Testnet',
  network: 'sonic-blaze-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
    public: { http: ['https://rpc.blaze.soniclabs.com'] }
  },
  blockExplorers: {
    default: {
      name: 'Sonic Blaze Testnet Explorer',
      url: 'https://testnet.sonicscan.org',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1100,
    },
  },
  testnet: true,
})

const chains = [sonicBlazeTestnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral', description: 'DEX Engine', url: 'https://integral.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  chainImages: {
    57_054: ETHLogo
  },
  defaultChain: sonicBlazeTestnet,
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
