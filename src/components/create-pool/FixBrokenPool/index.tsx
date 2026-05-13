import { useCallback, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";

import { CurrencyAmount, Currency, TickMath, Percent } from "@cryptoalgebra/integral-sdk";

import { ApprovalState } from "@/types/approve-state";

import { useBestTradeExactIn } from "@/hooks/swap/useBestTrade";
import { useApproveCallbackFromTrade } from "@/hooks/common/useApprove";
import { useSwapCallback } from "@/hooks/swap/useSwapCallback";

import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import { useAppKitNetwork } from "@reown/appkit/react";

interface IFixBrokenPool {
    currencyIn?: Currency;
    currencyOut?: Currency;
    deployer?: Address | null;
}

const DEFAULT_SLIPPAGE = new Percent(50, 10_000);

const Notification = ({ tick }: { tick?: number }) => (
    <div className="rounded-lg border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-text">
        {`Pool maintenance required. Current edge tick: ${tick}`}
    </div>
);

const FixBrokenPool = ({ currencyIn, currencyOut, deployer }: IFixBrokenPool) => {
    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const { address: account } = useAccount();

    const currencyAmount = useMemo(
        () => (currencyIn ? CurrencyAmount.fromRawAmount(currencyIn, 10 ** Math.floor(currencyIn.decimals / 2)) : undefined),
        [currencyIn],
    );

    const exactInSwap = useBestTradeExactIn(currencyAmount, currencyOut);

    const givenPool = useMemo(() => {
        const routePools = exactInSwap?.trade?.route.pools;

        if (!routePools) return undefined;

        if (routePools.length > 1) {
            console.error("[FIX POOL] Route path is longer than 1");
            return undefined;
        }

        return routePools[0];
    }, [exactInSwap]);

    const isBroken =
        givenPool &&
        (givenPool.tickCurrent <= TickMath.MIN_TICK + givenPool.tickSpacing ||
            givenPool.tickCurrent >= TickMath.MAX_TICK - givenPool.tickSpacing);

    const trade = isBroken && exactInSwap?.trade ? exactInSwap.trade : undefined;

    const { data: inputBalance } = useBalance({
        address: account,
        token: currencyIn?.isNative ? undefined : (currencyIn?.address as Address),
    });

    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(trade, DEFAULT_SLIPPAGE);

    const showApproveFlow =
        approvalState === ApprovalState.NOT_APPROVED ||
        approvalState === ApprovalState.RESET_REQUIRED ||
        approvalState === ApprovalState.PENDING;
    const isResetApprovalRequired = approvalState === ApprovalState.RESET_REQUIRED;

    const swapCallback = useSwapCallback(trade, DEFAULT_SLIPPAGE);

    const { callback, isLoading: isSwapLoading } = swapCallback;

    const handleSwap = useCallback(async () => {
        if (!callback) return;
        try {
            await callback();
        } catch (error) {
            return new Error(`Swap Failed ${error}`);
        }
    }, [callback]);

    const isWrongChain = !userChainId || appChainId !== userChainId;

    const insufficientBalance = inputBalance && trade ? trade.inputAmount.greaterThan(inputBalance.value.toString()) : undefined;

    if (!isBroken || isWrongChain || !account || !currencyIn || !currencyOut || !deployer) {
        return null;
    }

    if (trade && insufficientBalance) {
        return (
            <div className="flex flex-col gap-2">
                <Notification tick={givenPool?.tickCurrent} />
                <Button variant={"primary"} className="h-11 rounded-md" disabled>
                    {isSwapLoading ? <Loader /> : `Insufficient ${currencyIn.symbol} amount to fix`}
                </Button>
            </div>
        );
    }

    if (showApproveFlow) {
        return (
            <div className="flex flex-col gap-2">
                <Notification tick={givenPool?.tickCurrent} />
                <Button
                    variant={"primary"}
                    className="h-11 rounded-md"
                    disabled={approvalState === ApprovalState.PENDING}
                    onClick={() => approvalCallback && approvalCallback()}
                >
                    {approvalState === ApprovalState.PENDING ? (
                        <Loader />
                    ) : approvalState === ApprovalState.APPROVED ? (
                        "Approved"
                    ) : isResetApprovalRequired ? (
                        `Reset ${currencyIn?.symbol ?? "token"} approval`
                    ) : (
                        `Approve ${currencyIn?.symbol}`
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Notification tick={givenPool?.tickCurrent} />
            <Button variant={"primary"} className="h-11 rounded-md" onClick={() => handleSwap()} disabled={isSwapLoading}>
                {isSwapLoading ? <Loader /> : "Fix Pool"}
            </Button>
        </div>
    );
};

export default FixBrokenPool;
