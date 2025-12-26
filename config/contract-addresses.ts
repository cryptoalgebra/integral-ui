import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.Henesys]: "0xab49321DF952315E208a2B7046A00d2015E39cba",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.Henesys]: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.Henesys]: "0x6AD6A4f233F1E33613e996CCc17409B93fF8bf5f",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.Henesys]: "0x658E287E9C820484f5808f687dC4863B552de37D",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.Henesys]: "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.Henesys]: "0x28DeD2af752655Df5Ee92450DC259F92a5ABe449",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.Henesys]: null,
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.Henesys]: null,
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.Henesys]: null,
};
export const VOTER: Record<number, Address> = {
    [ChainId.Henesys]: null,
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.Henesys]: null,
};
