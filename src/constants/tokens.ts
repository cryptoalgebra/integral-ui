import { Token } from "@cryptoalgebra/sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0xEf213441a85DF4d7acBdAe0Cf78004E1e486BB96'.toLowerCase(), 18, 'RUSDT', 'RUSDT')
}
