import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { Address, erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";

export function useNeedAllowance(
    currency: Currency | null | undefined,
    amount: CurrencyAmount<Currency> | undefined,
    spender: Address | undefined,
    fastPolling: boolean = false
) {
    const { address: account } = useAccount();

    const { data: allowance, refetch } = useReadContract({
        address: currency?.wrapped.address as Address,
        abi: erc20Abi,
        functionName: "allowance",
        args: account && spender ? [account, spender] : undefined,
        query: {
            refetchInterval: fastPolling ? 1000 : false,
        },
    });

    const needAllowance = Boolean(
        !currency?.isNative && typeof allowance === "bigint" && amount && amount.greaterThan(allowance.toString())
    );

    return { needAllowance, refetchAllowance: refetch };
}
