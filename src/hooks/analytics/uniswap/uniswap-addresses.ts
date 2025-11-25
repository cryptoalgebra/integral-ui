type UniswapTokenAddress = string;
type IntegralTokenAddress = string;

type UniswapPoolAddress = string;
type IntegralPoolAddress = string;

export const uniswapPlaceholderTokens: Record<IntegralTokenAddress, UniswapTokenAddress> = {
    "0x4200000000000000000000000000000000000006": "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
    "0xabac6f23fdf1313fc2e9c9244f666157ccd32990": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
};

export const uniswapPlaceholderPools: Record<IntegralPoolAddress, UniswapPoolAddress> = {
    "0xe503570f52edecf66338e8b7584c66644d148ef9": "0xa60a504d92a1c95bda729c3f745b361ca822d6dd", // ETH - USDC base
};
