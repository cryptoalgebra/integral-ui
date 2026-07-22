import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.Hemi]: "0x10253594A832f967994b44f33411940533302ACb",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.Hemi]: "0x13fcE0acbe6Fb11641ab753212550574CaD31415",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.Hemi]: "0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.Hemi]: "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.Hemi]: "0xB4F9b6b019E75CBe51af4425b2Fc12797e2Ee2a1",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x50FCbF85d23aF7C91f94842FeCd83d16665d27bA",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.Hemi]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.Hemi]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.Hemi]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.Hemi]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.Hemi]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.Hemi]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};

/* Prediction */
export const BINARY_LMSR_MARKET_MANAGER: Record<number, Address> = {
    [ChainId.Hemi]: "0xf04604de76eb31004F2331bd0701b6eBF8ffdCB1",
};

/* NAV Hook */
export const PRICE_CONVERGENCE_VAULT_BY_POOL: Record<number, Record<Address, Address>> = {
    [ChainId.Hemi]: {
        // pool address -> vault address
        // "0x25827078a91d0875376a8a9f1bcfb35827ce0d4f": "0x1A6EB0846DEaBf20eF5e11F07205D17518Ead9B1",
    },
};
export const PRICE_CONVERGENCE_VAULT_DEPOSIT_GUARD_BY_POOL: Record<number, Record<Address, Address>> = {
    [ChainId.Hemi]: {
        // pool address -> vault deposit guard address
        // "0x25827078a91d0875376a8a9f1bcfb35827ce0d4f": "0xb9aA6adde7319c68D90879855D2bE28D3e235A2E",
    },
};
