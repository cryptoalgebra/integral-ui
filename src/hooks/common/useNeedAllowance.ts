import { ALGEBRA_LIMIT_ORDER_PLUGIN, ALGEBRA_POSITION_MANAGER } from "@/constants/addresses";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { erc20ABI, useAccount, useContractRead } from "wagmi";

export function useNeedAllowance(currency: Currency | null | undefined, amount: CurrencyAmount<Currency> | undefined) {

    const { address: account } = useAccount()

    const { data: allowance } = useContractRead({
        address: currency?.wrapped.address as Account,
        abi: erc20ABI,
        functionName: 'allowance',
        watch: true,
        args: account && [account, ALGEBRA_LIMIT_ORDER_PLUGIN]
    });

    return Boolean(!currency?.isNative &&
        typeof allowance === 'bigint' &&
        amount &&
        amount.greaterThan(allowance.toString()))

}