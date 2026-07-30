import { ContractConfig } from "@wagmi/cli";
import { AppKitNetwork } from "@reown/appkit/networks";
import {
    algebraBasePluginV1ABI,
    algebraCustomPluginFactoryABI,
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
    rebaseRewardABI,
    votingEscrowABI,
    securityRegistryABI,
    binaryLMSRMarketManagerABI,
    priceConvergenceVaultABI,
    priceConvergenceVaultDepositGuardABI,
} from "./abis";
import {
    ALGEBRA_ETERNAL_FARMING,
    ALGEBRA_FACTORY,
    BINARY_LMSR_MARKET_MANAGER,
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
import { defineChain } from "viem";
import { DEFAULT_CHAIN_ID } from "./default-chain";

const zenithTestnetChain = /*#__PURE__*/ defineChain({
    id: 936485,
    network: "zenith-testnet",
    name: "Zenith Testnet",
    nativeCurrency: { name: "Signet BTC", symbol: "sBTC", decimals: 18 },
    rpcUrls: {
        default: {
            http: ["https://rpc.testnet.zenith.network"],
        },
        public: {
            http: ["https://rpc.testnet.zenith.network"],
        },
    },
    blockExplorers: {
        default: {
            name: "Zenith Explorer",
            url: "https://explorer.testnet.zenith.network/",
        },
        etherscan: {
            name: "Zenith Explorer",
            url: "https://explorer.testnet.zenith.network/",
        },
    },
    contracts: {
        multicall3: {
            address: "0x38A5C36FA8c8c9E4649b51FCD61810B14e7ce047",
            blockCreated: 35280,
        },
    },
});

/* configure supported networks here */
export const wagmiNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [zenithTestnetChain];

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
    { name: "AlgebraCustomPluginFactory", abi: algebraCustomPluginFactoryABI },
    { name: "WrappedNative", abi: wNativeABI },
    { name: "Voter", abi: voterABI },
    { name: "VotingReward", abi: votingRewardABI },
    { name: "RebaseReward", abi: rebaseRewardABI },
    { name: "VotingEscrow", abi: votingEscrowABI },
    { name: "SecurityRegistry", abi: securityRegistryABI },
    { name: "BinaryLMSRMarketManager", abi: binaryLMSRMarketManagerABI },
    { name: "PriceConvergenceVault", abi: priceConvergenceVaultABI },
    { name: "PriceConvergenceVaultDepositGuard", abi: priceConvergenceVaultDepositGuardABI },
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
    BinaryLMSRMarketManager: BINARY_LMSR_MARKET_MANAGER,
};

export const wagmiContracts: ContractConfig[] = rawContracts
    .map((contract) => ({
        name: contract.name,
        abi: contract.abi,
        address: contractAddresses[contract.name as keyof typeof contractAddresses],
    }))
    .filter((contract) => contract.address?.[DEFAULT_CHAIN_ID] !== null);
