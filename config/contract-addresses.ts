import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x10253594A832f967994b44f33411940533302ACb",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x13fcE0acbe6Fb11641ab753212550574CaD31415",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
