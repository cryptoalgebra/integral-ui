import { WNATIVE, Token, ChainId } from "@cryptoalgebra/integral-sdk"

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
    [ChainId.BSCTestnet]: [...WETH_ONLY[ChainId.BSCTestnet]]
}