type UniswapTokenAddress = string;
type IntegralTokenAddress = string;

type UniswapPoolAddress = string;
type IntegralPoolAddress = string;

export const uniswapPlaceholderTokens: Record<IntegralTokenAddress, UniswapTokenAddress> = {
    "0x4200000000000000000000000000000000000006": "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
    "0xabac6f23fdf1313fc2e9c9244f666157ccd32990": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
};

export const uniswapPlaceholderPools: Record<IntegralPoolAddress, UniswapPoolAddress> = {
    "0x671ddf7e29272c5bf6996f765fabf58351cff137": "0xd0b53d9277642d899df5c87a3966a349a798f224", // ETH - USDC base
    "0xe7e221f4adaed1d6660354fdc6a7f11cc0aa5a40": "0xe47f7dba68a00dc1a6f11458bcdfca810e1cfebf",
    "0x4a1d36d8d868bafe8ea1060d4de478387bfab2f7": "0xfbb6eed8e7aa03b138556eedaf5d271a5e1e43ef"
};
