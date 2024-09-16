import { STABLECOINS } from "./tokens"
import { Token } from "@cryptoalgebra/integral-sdk"
import { WNATIVE_ADDRESS } from "./addresses"
import { DEFAULT_CHAIN_ID } from "./default-chain-id"

type ChainTokenList = {
    readonly [chainId: number]: Token[]
}

export const WNATIVE_TOKEN = new Token(DEFAULT_CHAIN_ID, WNATIVE_ADDRESS, 18, 'WETH', 'Wrapped Ether')

export const WNATIVE_EXTENDED: { [chainId: number]: Token } = {
    [DEFAULT_CHAIN_ID]: WNATIVE_TOKEN
}

const WNATIVE_ONLY: ChainTokenList = Object.fromEntries(
    Object.entries(WNATIVE_EXTENDED).map(([key, value]) => [key, [value]])
)

export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
    ...WNATIVE_ONLY,
    [DEFAULT_CHAIN_ID]: [...WNATIVE_ONLY[DEFAULT_CHAIN_ID], STABLECOINS.USDT]
}