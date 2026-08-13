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
    gatewayABI,
    identityABI,
    iidFactoryABI,
    ALLOWLIST_CHECKER_REGISTRY_ABI,
    ONCHAIN_ID_ALLOWLIST_CHECKER_ABI,
} from "./abis";
import {
    ALGEBRA_ETERNAL_FARMING,
    ALGEBRA_FACTORY,
    BINARY_LMSR_MARKET_MANAGER,
    GATEWAY,
    IID_FACTORY,
    FARMING_CENTER,
    LIMIT_ORDER_MANAGER,
    NONFUNGIBLE_POSITION_MANAGER,
    QUOTER_V2,
    REBASE_REWARD,
    SECURITY_REGISTRY,
    SWAP_ROUTER,
    VOTER,
    VOTING_ESCROW,
    ALLOWLIST_CHECKER_REGISTRY,
    ONCHAIN_ID_ALLOWLIST_CHECKER,
} from "./contract-addresses";
import { defineChain } from "viem";
import { DEFAULT_CHAIN_ID } from "./default-chain";

const robinhoodChain = /*#__PURE__*/ defineChain({
    id: 4663,
    network: "robinhood",
    name: "Robinhood Chain",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: {
            http: ["https://rpc.mainnet.chain.robinhood.com"],
        },
        public: {
            http: ["https://rpc.mainnet.chain.robinhood.com"],
        },
    },
    blockExplorers: {
        default: {
            name: "Robinhood Chain Explorer",
            url: "https://robinhoodchain.blockscout.com",
        },
        etherscan: {
            name: "Robinhood Chain Explorer",
            url: "https://robinhoodchain.blockscout.com",
        },
    },
    contracts: {
        multicall3: {
            address: "0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F",
            blockCreated: 35371485,
        },
    },
});

/* configure supported networks here */
export const wagmiNetworks: [AppKitNetwork, ...AppKitNetwork[]] = [robinhoodChain];

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
    { name: "Gateway", abi: gatewayABI },
    { name: "Identity", abi: identityABI },
    { name: "IIDFactory", abi: iidFactoryABI },
    { name: "AllowlistCheckerRegistry", abi: ALLOWLIST_CHECKER_REGISTRY_ABI },
    { name: "OnchainIdAllowlistChecker", abi: ONCHAIN_ID_ALLOWLIST_CHECKER_ABI },
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
    Gateway: GATEWAY,
    IIDFactory: IID_FACTORY,
    AllowlistCheckerRegistry: ALLOWLIST_CHECKER_REGISTRY,
    OnchainIdAllowlistChecker: ONCHAIN_ID_ALLOWLIST_CHECKER,
};

export const wagmiContracts: ContractConfig[] = rawContracts
    .map((contract) => ({
        name: contract.name,
        abi: contract.abi,
        address: contractAddresses[contract.name as keyof typeof contractAddresses],
    }))
    .filter((contract) => contract.address?.[DEFAULT_CHAIN_ID] !== null);
