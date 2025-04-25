import {
    CUSTOM_POOL_DEPLOYER_LIMIT_ORDER,
    CUSTOM_POOL_BASE,
    CUSTOM_POOL_DEPLOYER_ALM,
    CUSTOM_POOL_DEPLOYER_AI,
} from "@/constants/addresses.ts";
import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

const originalTitles = {
    [CUSTOM_POOL_BASE[ChainId.Base]]: "Base",
    [CUSTOM_POOL_DEPLOYER_LIMIT_ORDER[ChainId.Base]]: "Limit Order",
    [CUSTOM_POOL_DEPLOYER_ALM[ChainId.Base]]: "ALM",
    [CUSTOM_POOL_DEPLOYER_AI[ChainId.Base]]: "AI",
    [CUSTOM_POOL_BASE[ChainId.BaseSepolia]]: "Base",
    [CUSTOM_POOL_DEPLOYER_LIMIT_ORDER[ChainId.BaseSepolia]]: "Limit Order",
    [CUSTOM_POOL_DEPLOYER_ALM[ChainId.BaseSepolia]]: "ALM",
    [CUSTOM_POOL_DEPLOYER_AI[ChainId.Base]]: "AI",
};

export const customPoolDeployerTitles = Object.fromEntries(
    Object.entries(originalTitles).map(([key, value]) => [key.toLowerCase(), value])
);
