import { WNATIVE, Token, ChainId } from "@cryptoalgebra/integral-sdk"
import { DEFAULT_CHAIN_ID } from "./default-chain-id"

type ChainTokenList = {
    readonly [chainId: number]: Token[]
}

export const WMATIC_EXTENDED: { [chainId: number]: Token } = {
    ...WNATIVE
}

const WETH_ONLY: ChainTokenList = Object.fromEntries(
    Object.entries(WMATIC_EXTENDED).map(([key, value]) => [key, [value]])
)

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
    ...WETH_ONLY,
    [ChainId.Goerli]: [...WETH_ONLY[ChainId.Goerli]],
    [ChainId.BerachainTestnet]: [
        ...WETH_ONLY[ChainId.BerachainTestnet],
        new Token(DEFAULT_CHAIN_ID, '0x9dad8a1f64692adeb74aca26129e0f16897ff4bb', 8, 'WBTC', 'WBTC'),
        new Token(DEFAULT_CHAIN_ID, '0x6581e59a1c8da66ed0d313a0d4029dce2f746cc5', 18, 'stgUSDC', 'stgUSDC'),
    ]
}