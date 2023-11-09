import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import Layout from "@/components/common/Layout"
import { zkSyncTestnet } from 'viem/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

const chains = [zkSyncTestnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Velocore x Algebra Integral', description: 'Velocore x Algebra', url: 'https://velocore.algebra.finance', icons: [''] } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains, 
  chainImages: {
    5: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  defaultChain: zkSyncTestnet,
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
