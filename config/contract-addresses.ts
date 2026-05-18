import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x3f912b39A89708Db8E10205421d3726e2DF4984D",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xE63AEf68c9C80C06d241d44B3C21Da4da2E582Bd",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x6d63b39017F379bfd0301293022581C6EF237a19",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x2650e9EFe6D841622aA627cb9e493a8B8b2f9D7A",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0x8FFf6402215870Cbb8CB216C7A587Cb17D524B81",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.RaylsMainnet]: "0xf2c72D4EA4b3d54652Df182edA49b082678d02e3",
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
