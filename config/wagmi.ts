import { ContractConfig } from "@wagmi/cli";
import { AppKitNetwork } from "@reown/appkit/networks";
import {
    algebraBasePluginV1ABI,
    algebraCustomPoolEntryPointABI,
    algebraEternalFarmingABI,
    algebraFactoryABI,
    algebraPoolABI,
    farmingCenterABI,
    limitOrderManagerABI,
    nonfungiblePositionManagerABI,
    algebraVirtualPoolABI,
    quoterV2ABI,
    swapRouterABI,
    wNativeABI,
    voterABI,
    votingRewardABI,
    rebaseRewardAbi,
    votingEscrowABI,
} from "./abis";
import {
    ALGEBRA_ETERNAL_FARMING,
    ALGEBRA_FACTORY,
    FARMING_CENTER,
    LIMIT_ORDER_MANAGER,
    NONFUNGIBLE_POSITION_MANAGER,
    QUOTER_V2,
    REBASE_REWARD,
    SWAP_ROUTER,
    VOTER,
    VOTING_ESCROW,
} from "./contract-addresses";
import { defineChain } from "viem";

const baseSepoliaChain = /*#__PURE__*/ defineChain({
    id: 531050204,
    network: "sophon-os-testnet",
    name: "SophonOSTestnet",
    nativeCurrency: { name: "SOPH", symbol: "SOPH", decimals: 18 },
    rpcUrls: {
        default: {
            http: ["https://zksync-os-testnet-sophon.zksync.dev"],
        },
        public: {
            http: ["https://zksync-os-testnet-sophon.zksync.dev"],
        },
    },
    blockExplorers: {
        default: {
            name: "SophonOSTestnet",
            url: "https://block-explorer.zksync-os-testnet-sophon.zksync.dev",
        },
    },
    contracts: {
        multicall3: {
            address: "0xca11bde05977b3631167028862be2a173976ca11",
            blockCreated: 1468,
        },
    },
});

/* configure supported networks here */
export const wagmiNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [baseSepoliaChain];

const rawContracts = [
    { name: "AlgebraFactory", abi: algebraFactoryABI },
    { name: "AlgebraPool", abi: algebraPoolABI },
    { name: "AlgebraBasePluginV1", abi: algebraBasePluginV1ABI },
    { name: "NonfungiblePositionManager", abi: nonfungiblePositionManagerABI },
    { name: "QuoterV2", abi: quoterV2ABI },
    { name: "SwapRouter", abi: swapRouterABI },
    { name: "AlgebraEternalFarming", abi: algebraEternalFarmingABI },
    { name: "FarmingCenter", abi: farmingCenterABI },
    { name: "AlgebraVirtualPool", abi: algebraVirtualPoolABI },
    { name: "LimitOrderManager", abi: limitOrderManagerABI },
    { name: "AlgebraCustomPoolEntryPoint", abi: algebraCustomPoolEntryPointABI },
    { name: "WrappedNative", abi: wNativeABI },
    { name: "Voter", abi: voterABI },
    { name: "VotingReward", abi: votingRewardABI },
    { name: "RebaseReward", abi: rebaseRewardAbi },
    { name: "VotingEscrow", abi: votingEscrowABI },
];

const contractAddresses = {
    AlgebraFactory: ALGEBRA_FACTORY,
    NonfungiblePositionManager: NONFUNGIBLE_POSITION_MANAGER,
    QuoterV2: QUOTER_V2,
    SwapRouter: SWAP_ROUTER,
    AlgebraEternalFarming: ALGEBRA_ETERNAL_FARMING,
    FarmingCenter: FARMING_CENTER,
    LimitOrderManager: LIMIT_ORDER_MANAGER,
    Voter: VOTER,
    RebaseReward: REBASE_REWARD,
    VotingEscrow: VOTING_ESCROW,
};

export const wagmiContracts: ContractConfig[] = rawContracts.map((contract) => ({
    name: contract.name,
    abi: contract.abi,
    address: contractAddresses[contract.name as keyof typeof contractAddresses],
}));
