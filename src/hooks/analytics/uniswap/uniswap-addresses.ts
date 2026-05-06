type UniswapTokenAddress = string;
type IntegralTokenAddress = string;

type UniswapPoolAddress = string;
type IntegralPoolAddress = string;

export const uniswapPlaceholderTokens: Record<IntegralTokenAddress, UniswapTokenAddress> = {
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()]: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7": "0x55d398326f99059ff775485246999027b3197955", // USDT
    ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase()]: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
};

export const uniswapPlaceholderPools: Record<IntegralPoolAddress, UniswapPoolAddress> = {
    "0x410df0cb8466359bbc3ba25308a4d09bcc011234": "0x58f04aada1051885a3c4e296aab0a454ea1233a3", // ETH - USDC base
    "0x5f2e1d3211c8d01842de0745ba5088b77d9921af": "0x256aa364c44c44a3714bdb548237b0a4fd7de6c2", // ETH - USDC base
    "0x2a38e8b8bed38ebd296e94c16d2542e205254856": "0x7491c04dc4575e086a8ee31f7ce1c6d56fb7dcc1", // ETH - USDC base
    "0xb3de912462955182f7c7f9ca5d9573cdb38512c1": "0x8829abfa1a7b017078195c10a966d7411a0c9515", // ETH - USDC base
};
