import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import './styles/_colors.css'
import './App.css'

import { WagmiConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'
import Layout from "@/components/common/Layout"

const projectId = 'f370559ba7976e89ed93819ecdc03c64'

const chains = [goerli]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata: { name: 'Algebra Integral' } })

createWeb3Modal({ 
  wagmiConfig, 
  projectId, 
  chains, 
  chainImages: {
    5: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png'
  },
  defaultChain: goerli,
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
