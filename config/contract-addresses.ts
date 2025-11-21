import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.MantraDukong]: "0xd13da0E99aCA00164e6883f3798cF96cA0FFD097",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.MantraDukong]: "0xbc0db595753cfd03854cB2694dD84327F2f39c6C",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.MantraDukong]: "0xd11f357917B0181097EFB7adAee4705C89375f33",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.MantraDukong]: "0x4dA91886FA03a2b020A71c8EF23934283CB7A937",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.MantraDukong]: "0x714D34d49F155Ac332e00cD70070366a7B7CFBeC",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.MantraDukong]: "0x9c8AeE3Ad63be3D0F0702B6aaD6C3F94cBFF93F2",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.MantraDukong]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.MantraDukong]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.MantraDukong]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.MantraDukong]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.MantraDukong]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
