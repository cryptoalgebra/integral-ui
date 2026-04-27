type UniswapTokenAddress = string;
type IntegralTokenAddress = string;

type UniswapPoolAddress = string;
type IntegralPoolAddress = string;

export const uniswapPlaceholderTokens: Record<IntegralTokenAddress, UniswapTokenAddress> = {
    "0x4200000000000000000000000000000000000006": "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
    "0xabac6f23fdf1313fc2e9c9244f666157ccd32990": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
};

export const uniswapPlaceholderPools: Record<IntegralPoolAddress, UniswapPoolAddress> = {
    "0x410df0cb8466359bbc3ba25308a4d09bcc011234": "0x58f04aada1051885a3c4e296aab0a454ea1233a3", // ETH - USDC base
    "0x5f2e1d3211c8d01842de0745ba5088b77d9921af": "0x256aa364c44c44a3714bdb548237b0a4fd7de6c2", // ETH - USDC base
    "0x2a38e8b8bed38ebd296e94c16d2542e205254856": "0x7491c04dc4575e086a8ee31f7ce1c6d56fb7dcc1", // ETH - USDC base
    "0xb3de912462955182f7c7f9ca5d9573cdb38512c1": "0x8829abfa1a7b017078195c10a966d7411a0c9515", // ETH - USDC base
};
