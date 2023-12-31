import { ContractConfig, defineConfig } from '@wagmi/cli'
import { actions, react } from '@wagmi/cli/plugins'
import { ALGEBRA_FACTORY, ALGEBRA_LIMIT_ORDER_PLUGIN, ALGEBRA_POSITION_MANAGER, ALGEBRA_QUOTER, ALGEBRA_QUOTER_V2, ALGEBRA_ROUTER } from './src/constants/addresses'
import { algebraFactoryABI, algebraPoolABI, algebraPositionManagerABI, algebraQuoterABI, algebraLimitOrderPluginABI, algebraBasePluginABI, algebraRouterABI, algebraQuoterV2ABI } from './src/abis'

const contracts: ContractConfig[] = [
  {
    address: ALGEBRA_FACTORY,
    abi: algebraFactoryABI,
    name: 'AlgebraFactory'
  },
  {
    abi: algebraPoolABI,
    name: 'AlgebraPool'
  },
  {
    address: ALGEBRA_LIMIT_ORDER_PLUGIN,
    abi: algebraLimitOrderPluginABI,
    name: 'AlgebraLimitOrderPlugin'
  },
  {
    abi: algebraBasePluginABI,
    name: 'AlgebraBasePlugin'
  },
  {
    address: ALGEBRA_POSITION_MANAGER,
    abi: algebraPositionManagerABI,
    name: 'AlgebraPositionManager'
  },
  {
    address: ALGEBRA_QUOTER,
    abi: algebraQuoterABI,
    name: 'AlgebraQuoter'
  },
  {
    address: ALGEBRA_QUOTER_V2,
    abi: algebraQuoterV2ABI,
    name: 'AlgerbaQuoterV2'
  },
  {
    address: ALGEBRA_ROUTER,
    abi: algebraRouterABI,
    name: 'AlgebraRouter'
  }
]

export default defineConfig({
  out: 'src/generated.ts',
  contracts,
  plugins: [
    actions({
      watchContractEvent: false
    }),
    react({
      useContractEvent: false,
      useContractItemEvent: false
    })
  ],
})
