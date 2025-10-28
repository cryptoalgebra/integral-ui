import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x10253594A832f967994b44f33411940533302ACb",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0xa77aD9f635a3FB3bCCC5E6d1A87cB269746Aba17",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x3012E9049d05B4B5369D690114D5A5861EbB85cb",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x658E287E9C820484f5808f687dC4863B552de37D",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.SophonOSTestnet]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
