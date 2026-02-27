import { Pool, Position } from "@cryptoalgebra/integral-sdk";

/**
 * Creates a Position instance without enforcing tickSpacing alignment.
 * This is done by simulating a Pool with tickSpacing = 1.
 */
export function createUncheckedPosition(basePool: Pool, liquidity: string, tickLower: number, tickUpper: number) {
    const simulatedTickSpacing = 1;

    const simulatedPool = new Pool(
        basePool.token0,
        basePool.token1,
        basePool.fee,
        basePool.sqrtRatioX96,
        basePool.deployer,
        basePool.liquidity,
        basePool.tickCurrent,
        simulatedTickSpacing
    );

    return new Position({
        pool: simulatedPool,
        liquidity,
        tickLower,
        tickUpper,
    });
}
