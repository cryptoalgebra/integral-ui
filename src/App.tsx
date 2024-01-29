import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"
import { bscTestnet } from 'viem/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const chains = [bscTestnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Thena x Algebra Integral', description: 'Thena x Algebra', url: 'https://thena.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains, 
  defaultChain: bscTestnet,
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
