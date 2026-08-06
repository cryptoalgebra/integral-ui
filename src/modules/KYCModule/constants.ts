import { Hex } from "viem";

export const PERMISSIONED_POOL_MODULE_NAME = "Permissioned Pool Plugin";

export const PERMISSION_NONE = "0x0000" as Hex;
export const PERMISSION_ALL = "0xffff" as Hex;
export const SWAP_PERMISSION = 0x0001n;
export const LIQUIDITY_PERMISSION = 0x0002n;

export const CLAIM_SCHEME = 1n;
export const CLAIM_DATA = "0x" as Hex;
export const CLAIM_URI = "";
