import { invariant } from "@apollo/client/utilities/globals";
import {
    ADDRESS_ZERO,
    algebraPositionManagerABI,
    BigintIsh,
    Currency,
    CurrencyAmount,
    MethodParameters,
    ONE,
    Percent,
    PermitOptions,
    Pool,
    Position,
    SelfPermit,
    TickMath,
    encodeSqrtRatioX96,
    toHex,
    ZERO,
} from "@cryptoalgebra/integral-sdk";
import NativeCurrency from "@cryptoalgebra/integral-sdk/dist/entities/NativeCurrency";
import JSBI from "jsbi";
import { Interface } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";

function validateAndParseAddress(address: string): string {
    try {
        return getAddress(address);
    } catch (error) {
        throw new Error(`${address} is not a valid address.`);
    }
}

export const MaxUint128 = toHex(JSBI.subtract(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(128)), JSBI.BigInt(1)));

export interface MintSpecificOptions {
    /**
     * The account that should receive the minted NFT.
     */
    recipient: string;

    /**
     * Creates pool if not initialized before mint.
     */
    createPool?: boolean;
}

export interface IncreaseSpecificOptions {
    /**
     * Indicates the ID of the position to increase liquidity for.
     */
    tokenId: BigintIsh;
}

/**
 * Options for producing the calldata to add liquidity.
 */
export interface CommonAddLiquidityOptions {
    /**
     * How much the pool price is allowed to move.
     */
    slippageTolerance: Percent;

    /**
     * When the transaction expires, in epoch seconds.
     */
    deadline: BigintIsh;

    /**
     * Pool Deployer address. ZERO_ADDRESS if base pool
     */
    deployer?: string;

    /**
     * Whether to spend ether. If true, one of the pool tokens must be WETH, by default false
     */
    useNative?: NativeCurrency;

    /**
     * The optional permit parameters for spending token0
     */
    token0Permit?: PermitOptions;

    /**
     * The optional permit parameters for spending token1
     */
    token1Permit?: PermitOptions;
}

export type MintOptions = CommonAddLiquidityOptions & MintSpecificOptions;
export type IncreaseOptions = CommonAddLiquidityOptions & IncreaseSpecificOptions;

export type AddLiquidityOptions = MintOptions | IncreaseOptions;

// type guard
function isMint(options: AddLiquidityOptions): options is MintOptions {
    return Object.keys(options).some((k) => k === "recipient");
}

export interface CollectOptions {
    /**
     * Indicates the ID of the position to collect for.
     */
    tokenId: BigintIsh;

    /**
     * Expected value of tokensOwed0, including as-of-yet-unaccounted-for fees/liquidity value to be burned
     */
    expectedCurrencyOwed0: CurrencyAmount<Currency>;

    /**
     * Expected value of tokensOwed1, including as-of-yet-unaccounted-for fees/liquidity value to be burned
     */
    expectedCurrencyOwed1: CurrencyAmount<Currency>;

    /**
     * The account that should receive the tokens.
     */
    recipient: string;
}

export interface CollectAllPositionOptions {
    /**
     * Indicates the ID of the position to collect for.
     */
    tokenId: BigintIsh;

    /**
     * The account that should receive the tokens.
     */
    recipient: string;

    /**
     * Position currencies. Needed to detect native and add unwrap/sweep calls when required.
     */
    currency0: Currency;
    currency1: Currency;

    /**
     * Optional expected fees. If omitted, unwrap/sweep minimums default to 0.
     */
    expectedCurrencyOwed0?: CurrencyAmount<Currency>;
    expectedCurrencyOwed1?: CurrencyAmount<Currency>;
}

export interface NFTPermitOptions {
    v: 0 | 1 | 27 | 28;
    r: string;
    s: string;
    deadline: BigintIsh;
    spender: string;
}

/**
 * Options for producing the calldata to exit a position.
 */
export interface RemoveLiquidityOptions {
    /**
     * The ID of the token to exit
     */
    tokenId: BigintIsh;

    /**
     * The percentage of position liquidity to exit.
     */
    liquidityPercentage: Percent;

    /**
     * How much the pool price is allowed to move.
     */
    slippageTolerance: Percent;

    /**
     * When the transaction expires, in epoch seconds.
     */
    deadline: BigintIsh;

    /**
     * Whether the NFT should be burned if the entire position is being exited, by default false.
     */
    burnToken?: boolean;

    /**
     * The optional permit of the token ID being exited, in case the exit transaction is being sent by an account that does not own the NFT
     */
    permit?: NFTPermitOptions;

    /**
     * Parameters to be passed on to collect
     */
    collectOptions: Omit<CollectOptions, "tokenId">;
}

export abstract class NonfungiblePositionManager extends SelfPermit {
    public static INTERFACE: Interface = new Interface(algebraPositionManagerABI);

    /**
     * Cannot be constructed.
     */
    private constructor() {
        super();
    }

    public static createCallParameters(pool: Pool, deployer?: string): MethodParameters {
        return {
            calldata: this.encodeCreate(pool, deployer || pool.deployer),
            value: toHex(0),
        };
    }

    public static addCallParameters(position: Position, options: AddLiquidityOptions): { calldata: string[]; value: string } {
        invariant(JSBI.greaterThan(position.liquidity, ZERO), "ZERO_LIQUIDITY");

        const calldatas: string[] = [];

        // get amounts
        const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

        // adjust for
        const minimumAmounts = this.getMintAmountsWithSlippage(position, options.slippageTolerance);

        console.log("Desired amounts", {
            amount0: amount0Desired.toString(),
            amount1: amount1Desired.toString(),
        });

        console.log("Slippage", options.slippageTolerance.toSignificant(24) + "%");
        console.log("Minimum amounts with slippage", {
            amount0: minimumAmounts.amount0.toString(),
            amount1: minimumAmounts.amount1.toString(),
        });

        const amount0Min = toHex(minimumAmounts.amount0);
        const amount1Min = toHex(minimumAmounts.amount1);

        const deadline = toHex(options.deadline);

        // create pool if needed
        if (isMint(options) && options.createPool) {
            calldatas.push(this.encodeCreate(position.pool, options.deployer || position.pool.deployer));
        }

        // permits if necessary
        if (options.token0Permit) {
            calldatas.push(NonfungiblePositionManager.encodePermit(position.pool.token0, options.token0Permit));
        }

        if (options.token1Permit) {
            calldatas.push(NonfungiblePositionManager.encodePermit(position.pool.token1, options.token1Permit));
        }

        // mint
        if (isMint(options)) {
            const recipient: string = validateAndParseAddress(options.recipient);

            calldatas.push(
                NonfungiblePositionManager.INTERFACE.encodeFunctionData("mint", [
                    {
                        token0: position.pool.token0.address,
                        token1: position.pool.token1.address,
                        deployer: position.pool.deployer,
                        tickLower: position.tickLower,
                        tickUpper: position.tickUpper,
                        amount0Desired: toHex(amount0Desired),
                        amount1Desired: toHex(amount1Desired),
                        amount0Min,
                        amount1Min,
                        recipient,
                        deadline,
                    },
                ]),
            );
        } else {
            // increase

            calldatas.push(
                NonfungiblePositionManager.INTERFACE.encodeFunctionData("increaseLiquidity", [
                    {
                        tokenId: toHex(options.tokenId),
                        amount0Desired: toHex(amount0Desired),
                        amount1Desired: toHex(amount1Desired),
                        amount0Min,
                        amount1Min,
                        deadline,
                    },
                ]),
            );
        }

        let value: string = toHex(0);

        if (options.useNative) {
            const wrapped = options.useNative.wrapped;
            invariant(position.pool.token0.equals(wrapped) || position.pool.token1.equals(wrapped), "NO_WNative");

            const wrappedValue = position.pool.token0.equals(wrapped) ? amount0Desired : amount1Desired;

            // we only need to refund if we're actually sending ETH
            if (JSBI.greaterThan(wrappedValue, ZERO)) {
                calldatas.push(NonfungiblePositionManager.INTERFACE.encodeFunctionData("refundNativeToken"));
            }

            value = toHex(wrappedValue);
        }

        return {
            calldata: calldatas,
            value,
        };
    }

    private static getMintAmountsWithSlippage(position: Position, slippageTolerance: Percent): Readonly<{ amount0: JSBI; amount1: JSBI }> {
        const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

        const priceLower = position.pool.token0Price.asFraction.multiply(new Percent(1).subtract(slippageTolerance));
        const priceUpper = position.pool.token0Price.asFraction.multiply(slippageTolerance.add(1));

        let sqrtRatioX96Lower = encodeSqrtRatioX96(priceLower.numerator, priceLower.denominator);
        if (JSBI.lessThanOrEqual(sqrtRatioX96Lower, TickMath.MIN_SQRT_RATIO)) {
            sqrtRatioX96Lower = JSBI.add(TickMath.MIN_SQRT_RATIO, JSBI.BigInt(1));
        }

        let sqrtRatioX96Upper = encodeSqrtRatioX96(priceUpper.numerator, priceUpper.denominator);
        if (JSBI.greaterThanOrEqual(sqrtRatioX96Upper, TickMath.MAX_SQRT_RATIO)) {
            sqrtRatioX96Upper = JSBI.subtract(TickMath.MAX_SQRT_RATIO, JSBI.BigInt(1));
        }

        const poolLower = new Pool(
            position.pool.token0,
            position.pool.token1,
            position.pool.fee,
            sqrtRatioX96Lower,
            position.pool.deployer,
            0,
            TickMath.getTickAtSqrtRatio(sqrtRatioX96Lower),
            position.pool.tickSpacing,
        );

        const poolUpper = new Pool(
            position.pool.token0,
            position.pool.token1,
            position.pool.fee,
            sqrtRatioX96Upper,
            position.pool.deployer,
            0,
            TickMath.getTickAtSqrtRatio(sqrtRatioX96Upper),
            position.pool.tickSpacing,
        );

        const positionThatWillBeCreated = Position.fromAmounts({
            pool: position.pool,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            amount0: amount0Desired,
            amount1: amount1Desired,
            useFullPrecision: true,
        });

        const amount0 = new Position({
            pool: poolUpper,
            liquidity: positionThatWillBeCreated.liquidity,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
        }).mintAmounts.amount0;

        const amount1 = new Position({
            pool: poolLower,
            liquidity: positionThatWillBeCreated.liquidity,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
        }).mintAmounts.amount1;

        const isOutOfRange = position.pool.tickCurrent < position.tickLower || position.pool.tickCurrent >= position.tickUpper;

        if (!isOutOfRange) {
            return { amount0, amount1 };
        }

        const oneMinusSlippage = new Percent(1).subtract(slippageTolerance);

        const amount0WithOutOfRangeSlippage = JSBI.divide(
            JSBI.multiply(amount0Desired, oneMinusSlippage.numerator),
            oneMinusSlippage.denominator,
        );
        const amount1WithOutOfRangeSlippage = JSBI.divide(
            JSBI.multiply(amount1Desired, oneMinusSlippage.numerator),
            oneMinusSlippage.denominator,
        );

        return {
            amount0: JSBI.lessThan(amount0, amount0WithOutOfRangeSlippage) ? amount0 : amount0WithOutOfRangeSlippage,
            amount1: JSBI.lessThan(amount1, amount1WithOutOfRangeSlippage) ? amount1 : amount1WithOutOfRangeSlippage,
        };
    }

    public static collectCallParameters(options: CollectOptions): { calldata: string[]; value: string } {
        const calldatas: string[] = NonfungiblePositionManager.encodeCollect(options);

        return {
            calldata: calldatas,
            value: toHex(0),
        };
    }

    public static collectAllCallParameters(options: CollectAllPositionOptions[]): { calldata: string[]; value: string } {
        const calldatas: string[] = options.flatMap((option) => NonfungiblePositionManager.encodeCollect(option));

        return {
            calldata: calldatas,
            value: toHex(0),
        };
    }

    /**
     * Produces the calldata for completely or partially exiting a position
     * @param position The position to exit
     * @param options Additional information necessary for generating the calldata
     * @returns The call parameters
     */
    public static removeCallParameters(position: Position, options: RemoveLiquidityOptions): { calldata: string[]; value: string } {
        const calldatas: string[] = [];

        const deadline = toHex(options.deadline);
        const tokenId = toHex(options.tokenId);

        // construct a partial position with a percentage of liquidity
        const partialPosition = new Position({
            pool: position.pool,
            liquidity: options.liquidityPercentage.multiply(position.liquidity).quotient,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
        });
        invariant(JSBI.greaterThan(partialPosition.liquidity, ZERO), "ZERO_LIQUIDITY");

        // slippage-adjusted underlying amounts
        const { amount0: amount0Min, amount1: amount1Min } = partialPosition.burnAmountsWithSlippage(options.slippageTolerance);

        if (options.permit) {
            calldatas.push(
                NonfungiblePositionManager.INTERFACE.encodeFunctionData("permit", [
                    validateAndParseAddress(options.permit.spender),
                    tokenId,
                    toHex(options.permit.deadline),
                    options.permit.v,
                    options.permit.r,
                    options.permit.s,
                ]),
            );
        }

        // remove liquidity
        calldatas.push(
            NonfungiblePositionManager.INTERFACE.encodeFunctionData("decreaseLiquidity", [
                {
                    tokenId,
                    liquidity: toHex(partialPosition.liquidity),
                    amount0Min: toHex(amount0Min),
                    amount1Min: toHex(amount1Min),
                    deadline,
                },
            ]),
        );

        const { expectedCurrencyOwed0, expectedCurrencyOwed1, ...rest } = options.collectOptions;
        calldatas.push(
            ...NonfungiblePositionManager.encodeCollect({
                tokenId: options.tokenId,
                // add the underlying value to the expected currency already owed
                expectedCurrencyOwed0: expectedCurrencyOwed0.add(CurrencyAmount.fromRawAmount(expectedCurrencyOwed0.currency, amount0Min)),
                expectedCurrencyOwed1: expectedCurrencyOwed1.add(CurrencyAmount.fromRawAmount(expectedCurrencyOwed1.currency, amount1Min)),
                ...rest,
            }),
        );

        if (options.liquidityPercentage.equalTo(ONE)) {
            if (options.burnToken) {
                calldatas.push(NonfungiblePositionManager.INTERFACE.encodeFunctionData("burn", [tokenId]));
            }
        } else {
            invariant(options.burnToken !== true, "CANNOT_BURN");
        }

        return {
            calldata: calldatas,
            value: toHex(0),
        };
    }

    private static encodeCreate(pool: Pool, deployer: string): string {
        return NonfungiblePositionManager.INTERFACE.encodeFunctionData("createAndInitializePoolIfNecessary", [
            pool.token0.address,
            pool.token1.address,
            deployer,
            toHex(pool.sqrtRatioX96),
            "0x",
        ]);
    }

    private static encodeCollect(options: CollectOptions | CollectAllPositionOptions): string[] {
        const calldatas: string[] = [];

        const tokenId = toHex(options.tokenId);

        const expectedCurrencyOwed0 = "expectedCurrencyOwed0" in options ? options.expectedCurrencyOwed0 : undefined;
        const expectedCurrencyOwed1 = "expectedCurrencyOwed1" in options ? options.expectedCurrencyOwed1 : undefined;
        const currency0 = expectedCurrencyOwed0?.currency ?? ("currency0" in options ? options.currency0 : undefined);
        const currency1 = expectedCurrencyOwed1?.currency ?? ("currency1" in options ? options.currency1 : undefined);
        const involvesETH = Boolean(currency0?.isNative || currency1?.isNative);

        const recipient = validateAndParseAddress(options.recipient);

        // collect
        calldatas.push(
            NonfungiblePositionManager.INTERFACE.encodeFunctionData("collect", [
                {
                    tokenId,
                    recipient: involvesETH ? ADDRESS_ZERO : recipient,
                    amount0Max: MaxUint128,
                    amount1Max: MaxUint128,
                },
            ]),
        );

        if (involvesETH) {
            const ethAmount = expectedCurrencyOwed0?.currency.isNative
                ? expectedCurrencyOwed0.quotient
                : expectedCurrencyOwed1?.currency.isNative
                ? expectedCurrencyOwed1.quotient
                : ZERO;
            const tokenCurrency = currency0?.isNative ? currency1 : currency0;
            const tokenAmount = expectedCurrencyOwed0?.currency.isNative
                ? expectedCurrencyOwed1?.quotient ?? ZERO
                : expectedCurrencyOwed0?.quotient ?? ZERO;

            calldatas.push(NonfungiblePositionManager.INTERFACE.encodeFunctionData("unwrapWNativeToken", [toHex(ethAmount), recipient]));

            if (tokenCurrency && !tokenCurrency.isNative) {
                calldatas.push(
                    NonfungiblePositionManager.INTERFACE.encodeFunctionData("sweepToken", [
                        tokenCurrency.wrapped.address,
                        toHex(tokenAmount),
                        recipient,
                    ]),
                );
            }
        }

        return calldatas;
    }
}
