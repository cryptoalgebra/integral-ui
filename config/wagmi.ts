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
    securityRegistryAbi,
} from "./abis";
import {
    ALGEBRA_ETERNAL_FARMING,
    ALGEBRA_FACTORY,
    FARMING_CENTER,
    LIMIT_ORDER_MANAGER,
    NONFUNGIBLE_POSITION_MANAGER,
    QUOTER_V2,
    REBASE_REWARD,
    SECURITY_REGISTRY,
    SWAP_ROUTER,
    VOTER,
    VOTING_ESCROW,
} from "./contract-addresses";
import { DEFAULT_CHAIN_ID } from "./default-chain";
import { defineChain } from "viem";

const mainnet = /*#__PURE__*/ defineChain({
    id: 36900,
    name: "ADI Network",
    nativeCurrency: { name: "ADI", symbol: "ADI", decimals: 18 },
    rpcUrls: {
        default: {
            http: ["https://rpc.adifoundation.ai/"],
        },
    },
    blockExplorers: {
        default: {
            name: "Etherscan",
            url: "https://explorer.adifoundation.ai/",
        },
    },
    contracts: {
        multicall3: {
            address: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
            blockCreated: 387_691,
        },
    },
});

/* configure supported networks here */
export const wagmiNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet];

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
    { name: "SecurityRegistry", abi: securityRegistryAbi },
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
    SecurityRegistry: SECURITY_REGISTRY,
};

export const wagmiContracts: ContractConfig[] = rawContracts
    .map((contract) => ({
        name: contract.name,
        abi: contract.abi,
        address: contractAddresses[contract.name as keyof typeof contractAddresses],
    }))
    .filter((contract) => contract.address?.[DEFAULT_CHAIN_ID] !== null);
