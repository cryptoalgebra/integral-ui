import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { Currency, CurrencyAmount, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useCallback, useMemo, useState } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useNAVHookPool } from "./useNAVHookPool";

interface UseNAVHookDepositFormResult {
    amount0Value: string;
    amount1Value: string;
    amount0: CurrencyAmount<Currency> | undefined;
    amount1: CurrencyAmount<Currency> | undefined;
    amount0Usd: number | null;
    amount1Usd: number | null;
    hasAmounts: boolean;
    errorMessage: string | undefined;
    onAmount0Change: (value: string) => void;
    onAmount1Change: (value: string) => void;
    reset: () => void;
}

function currencyBalance(currency: Currency | undefined, balance: { value: bigint } | undefined) {
    if (!currency || !balance) return undefined;

    return CurrencyAmount.fromRawAmount(currency, balance.value.toString());
}

export function useNAVHookDepositForm(poolId: Address | undefined): UseNAVHookDepositFormResult {
    const { address: account } = useAccount();
    const { token0, token1 } = useNAVHookPool(poolId);
    const [amount0Value, setAmount0Value] = useState("");
    const [amount1Value, setAmount1Value] = useState("");

    const amount0 = useMemo(() => tryParseAmount(amount0Value, token0), [amount0Value, token0]);
    const amount1 = useMemo(() => tryParseAmount(amount1Value, token1), [amount1Value, token1]);
    const { formatted: amount0Usd } = useUSDCValue(amount0);
    const { formatted: amount1Usd } = useUSDCValue(amount1);

    const { data: token0Balance } = useBalance({
        address: account,
        token: token0?.isNative ? undefined : (token0?.wrapped.address as Address | undefined),
    });
    const { data: token1Balance } = useBalance({
        address: account,
        token: token1?.isNative ? undefined : (token1?.wrapped.address as Address | undefined),
    });

    const parsedToken0Balance = useMemo(() => currencyBalance(token0, token0Balance), [token0, token0Balance]);
    const parsedToken1Balance = useMemo(() => currencyBalance(token1, token1Balance), [token1, token1Balance]);

    const amount0Raw = amount0 ? BigInt(amount0.quotient.toString()) : 0n;
    const amount1Raw = amount1 ? BigInt(amount1.quotient.toString()) : 0n;
    const hasAmounts = amount0Raw + amount1Raw > 0n;

    const errorMessage = useMemo(() => {
        if (amount0 && parsedToken0Balance && parsedToken0Balance.lessThan(amount0)) {
            return `Insufficient ${token0?.symbol} balance`;
        }

        if (amount1 && parsedToken1Balance && parsedToken1Balance.lessThan(amount1)) {
            return `Insufficient ${token1?.symbol} balance`;
        }

        return undefined;
    }, [amount0, amount1, parsedToken0Balance, parsedToken1Balance, token0?.symbol, token1?.symbol]);

    const reset = useCallback(() => {
        setAmount0Value("");
        setAmount1Value("");
    }, []);

    return {
        amount0Value,
        amount1Value,
        amount0,
        amount1,
        amount0Usd,
        amount1Usd,
        hasAmounts,
        errorMessage,
        onAmount0Change: setAmount0Value,
        onAmount1Change: setAmount1Value,
        reset,
    };
}
