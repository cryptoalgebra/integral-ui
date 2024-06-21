import { Token } from "@cryptoalgebra/integral-sdk";

export interface TickProcessed {
    liquidityActive: bigint;
    tickIdx: number;
    liquidityNet: bigint;
    price0: string;
    price1: string;
    liquidityGross: bigint;
}

export interface TicksResult {
    ticksProcessed: TickProcessed[];
    tickSpacing: number;
    activeTickIdx: number;
    token0: Token;
    token1: Token;
}