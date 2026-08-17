import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x285C74f3d01296F96c5d3858ab482f707e8Bfdfc",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x41e65169b71Adb184EF4093a2D1A802F9C815c13",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x97c011Be3B2AF1908c8dAF8A2c1915F4f56E8125",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xF207b9E74Ff3943eC0Fc371C2607A7a1Bfb0eDCd",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x6aa9481De990bC12F906C5e8DE70D8556ac5ba2e",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xB50E639E23C954546C75d9C15363FC0375E5E95E",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x92E4eaCD3b49fa85D13E4B6E8d6bfd0CFafaeD75",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};

/* Prediction */
export const BINARY_LMSR_MARKET_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xf04604de76eb31004F2331bd0701b6eBF8ffdCB1",
};

/* NAV Hook */
export const PRICE_CONVERGENCE_VAULT_BY_POOL: Record<number, Record<Address, Address>> = {
    [ChainId.BaseSepolia]: {
        // pool address -> vault address
        "0x4A5856Ea3803aa06FF9d0ba63E18914C05773c94": "0xD0D27ED3b59D0E07A4889D765468a76660dd4dAA",
        "0xd05e0dc6176f558439184795f6f865719b562720": "0x10EE336bcCd978aD306988b40b8814BCD79C8b64",
    },
};
export const PRICE_CONVERGENCE_VAULT_DEPOSIT_GUARD_BY_POOL: Record<number, Record<Address, Address>> = {
    [ChainId.BaseSepolia]: {
        // pool address -> vault deposit guard address
        "0x4A5856Ea3803aa06FF9d0ba63E18914C05773c94": "0xf1f865Ee407Bfe9413e60Ee3a0daa4AAB76B83eC",
        "0xd05e0dc6176f558439184795f6f865719b562720": "0x70Aed7D447c3F78502120EDfE9cc5b45f77F603B",
    },
};

/* KYC */
export const IID_FACTORY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x7a1ca9131139F0A8dbf3CC41f3642BcaAA9a849e",
};
export const GATEWAY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x592C49164940ff8dDA47FDd543C2bcb2acC96494",
};
export const CLAIM_ISSUER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xd5a5A781c6835a41479c372Eb416381727d8bb0F",
};
export const ALLOWLIST_CHECKER_REGISTRY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x06b982a1870F739b1b18841dF43F5c7404561163",
};
export const ONCHAIN_ID_ALLOWLIST_CHECKER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xCEb36E63B9789F2CAae4B9F97E93807338Ef0643",
};
