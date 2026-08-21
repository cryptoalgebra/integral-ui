import { ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

/* Algebra Core */
export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.Base]: "0x53400eD24c77515397fC3A559fF1363DaB81B5c7",
};
export const QUOTER_V2: Record<number, Address> = {
    [ChainId.Base]: "0x2B9Ab81Ba16aa8eC06DF616179d521e95445Dca1",
};
export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.Base]: "0xd66C6299F73fd9c03e12539F80657ad71229dD1E",
};
export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.Base]: "0x62a314428455600a7fDf1D4F250a475121356E67",
};
export const SECURITY_REGISTRY: Record<number, Address> = {
    [ChainId.Base]: "0x2A8831aD920ae75Ca715DFd98C6cEF3f081c0248",
};

/* Farming */
export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.Base]: "0xF58F0C2c87b09E3Cd18e3cFF907CEd04A5b39c4e",
};
export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.Base]: "0x4c9d82605335cE015D95453c8F20FCf2cecC29C1",
};

/* Limit Orders */
export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.Base]: "0xdA9c1AF6498583Ae548CAd31c47eFde061569789",
};

/* Omega Router */
export const OMEGA_ROUTER: Record<number, Address> = {
    [ChainId.Base]: "0x51ce7FbA745eF4ce231B0a62059671B3862f3aEc",
};
export const OMEGA_QUOTER: Record<number, Address> = {
    [ChainId.Base]: "0x6711b3ED02dFEBe11A4598deA3A5F00Ae58e9016",
};
export const PERMIT2: Record<number, Address> = {
    [ChainId.Base]: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
};

/* Ve 3.3 */
export const TOKEN_ADDRESS: Record<number, Address> = {
    [ChainId.Base]: "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", // TOKEN erc20
};
export const VOTING_ESCROW: Record<number, Address> = {
    [ChainId.Base]: "0x8b7A9e5086157476E26f1E75342F0Da0582C57B4", // veTOKEN
};
export const VOTER: Record<number, Address> = {
    [ChainId.Base]: "0x1B79491D453FFb4eFf2B75b106052B1670AC8b27",
};
export const REBASE_REWARD: Record<number, Address> = {
    [ChainId.Base]: "0xd4BDe8f104d8317bB348D4bD7F96318Aad244932",
};

/* Prediction */
export const BINARY_LMSR_MARKET_MANAGER: Record<number, Address> = {
    [ChainId.Base]: "0xf04604de76eb31004F2331bd0701b6eBF8ffdCB1",
};

/* NAV Hook */
export const PRICE_CONVERGENCE_VAULT_BY_POOL: Record<number, Record<Address, Address>> = {
    [ChainId.Base]: {
        // pool address -> vault address
        "0x677deB381d39E44dE0641EaCB6E36637318043F7": "0x72BB034960A3D3bd37D09DDfeE7F2EB6B6b28Cb4",
    },
};
export const PRICE_CONVERGENCE_VAULT_DEPOSIT_GUARD_BY_POOL: Record<number, Record<Address, Address>> = {
    [ChainId.Base]: {
        // pool address -> vault deposit guard address
        "0x677deB381d39E44dE0641EaCB6E36637318043F7": "0x2A2b5B093D9ce39DBE517523c7637dE5E1e3961b",
    },
};
