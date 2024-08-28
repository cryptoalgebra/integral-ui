import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import {
  Currency as CurrencyBN,
  CurrencyAmount as CurrencyAmountBN,
} from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { erc20ABI, useAccount, useContractRead } from "wagmi";

export function useNeedAllowance(
  currency: Currency | CurrencyBN | null | undefined,
  amount: CurrencyAmount<Currency> | CurrencyAmountBN<CurrencyBN> | undefined,
  spender: Account | undefined
) {
  const { address: account } = useAccount();

  const { data: allowance } = useContractRead({
    address: currency?.wrapped.address as Account,
    abi: erc20ABI,
    functionName: "allowance",
    watch: true,
    args: account && spender && [account, spender],
  });

  return Boolean(
    !currency?.isNative &&
      typeof allowance === "bigint" &&
      amount &&
      amount.greaterThan(allowance.toString())
  );
}
