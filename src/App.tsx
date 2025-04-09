import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import { defineChain } from 'viem'
import Layout from "@/components/common/Layout"

import ETHLogo from '@/assets/tokens/ether.svg'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

export const sei = defineChain({
  id: 1329,
  name: 'Sei Network',
  network: 'sei',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://evm-rpc.sei-apis.com/'],
      webSocket: ['wss://evm-ws.sei-apis.com/'],
    },
    public: {
      http: ['https://evm-rpc.sei-apis.com/'],
      webSocket: ['wss://evm-ws.sei-apis.com/'],
    }
  },
  blockExplorers: {
    default: {
      name: 'Seitrace',
      url: 'https://seitrace.com',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
})
const chains = [sei]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral', description: 'DEX Engine', url: 'https://integral.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains,
  chainImages: {
    1329: ETHLogo
  },
  defaultChain: sei,
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
