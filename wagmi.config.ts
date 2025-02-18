import { ContractConfig, defineConfig } from "@wagmi/cli";
import { actions, react } from "@wagmi/cli/plugins";
import {
  algebraFactoryABI,
  algebraPoolABI,
  algebraPositionManagerABI,
  algebraQuoterABI,
  algebraBasePluginABI,
  algebraRouterABI,
  algebraQuoterV2ABI,
  algebraEternalFarmingABI,
  farmingCenterABI,
  wNativeABI,
  algebraVirtualPoolABI,
} from "./src/abis";

import AlgebraConfig from "./src/algebra.config";
import { Address } from "viem";

const ALGEBRA_QUOTER: Address = "0x38A5C36FA8c8c9E4649b51FCD61810B14e7ce047";

const contracts: ContractConfig[] = [
  {
    address: AlgebraConfig.V3_CONTRACTS.FACTORY_ADDRESS as Address,
    abi: algebraFactoryABI,
    name: "AlgebraFactory",
  },
  {
    abi: algebraPoolABI,
    name: "AlgebraPool",
  },
  {
    abi: algebraBasePluginABI,
    name: "AlgebraBasePlugin",
  },
  {
    address: AlgebraConfig.V3_CONTRACTS
      .NONFUNGIBLE_POSITION_MANAGER_ADDRESS as Address,
    abi: algebraPositionManagerABI,
    name: "AlgebraPositionManager",
  },
  {
    address: ALGEBRA_QUOTER,
    abi: algebraQuoterABI,
    name: "AlgebraQuoter",
  },
  {
    address: AlgebraConfig.V3_CONTRACTS.QUOTER_ADDRESS as Address,
    abi: algebraQuoterV2ABI,
    name: "AlgerbaQuoterV2",
  },
  {
    address: AlgebraConfig.V3_CONTRACTS.SWAP_ROUTER_ADDRESS as Address,
    abi: algebraRouterABI,
    name: "AlgebraRouter",
  },
  {
    address: AlgebraConfig.V3_CONTRACTS.ETERNAL_FARMING_ADDRESS as Address,
    abi: algebraEternalFarmingABI,
    name: "AlgebraEternalFarming",
  },
  {
    address: AlgebraConfig.V3_CONTRACTS.FARMING_CENTER_ADDRESS as Address,
    abi: farmingCenterABI,
    name: "FarmingCenter",
  },
  {
    abi: algebraVirtualPoolABI,
    name: "AlgebraVirtualPool",
  },
  {
    abi: wNativeABI,
    name: "WrappedNative",
  },
];

export default defineConfig({
  out: "src/generated.ts",
  contracts,
  plugins: [
    actions({
      watchContractEvent: false,
    }),
    react({
      useContractEvent: false,
      useContractItemEvent: false,
    }),
  ],
});
