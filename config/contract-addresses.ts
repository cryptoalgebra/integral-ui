import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x3B22094a64D3D6801a27Db4e58ac0B859A4C066d",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x28DeD2af752655Df5Ee92450DC259F92a5ABe449",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0xd9866Fc987AFCFc0C20b22a2B04b0574735032C5",
};
/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x83D4a9Ea77a4dbA073cD90b30410Ac9F95F93E7C",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0xEC250E6856e14A494cb1f0abC61d72348c79F418",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x0105fA46539565C66Cb1203F663489f93c773C4c",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.PharosTestnet]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};
