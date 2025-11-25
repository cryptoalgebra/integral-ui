import { PermitSingle } from "@uniswap/permit2-sdk";

export interface Permit extends PermitSingle {
    sigDeadline: number;
}

export interface PermitSignature extends Permit {
    signature: string;
}

export enum PermitState {
    LOADING = 0,
    NOT_PERMITTED = 1,
    PERMITTED = 2,
}

export enum AllowanceState {
    LOADING = 0,
    REQUIRED = 1,
    ALLOWED = 2,
}
