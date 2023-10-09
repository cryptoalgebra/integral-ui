import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Input } from "@/components/ui/input";
import { SwapFieldType } from "@/types/swap-field";
import { Currency, CurrencyAmount, Percent, Token } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address, useAccount, useBalance } from "wagmi";

interface TokenSwapCardProps {
    handleTokenSelection: (currency: Currency) => void;
    handleValueChange: (value: string) => void;
    handleMaxValue?: () => void;
    value: string;
    currency: Currency | null | undefined;
    otherCurrency: Currency | null | undefined;
    fiatValue: CurrencyAmount<Token> | undefined;
    priceImpact: Percent | undefined;
    showMaxButton?: boolean;
    field: SwapFieldType;
}

const TokenCard = ({ handleTokenSelection, handleValueChange, handleMaxValue, value, currency, otherCurrency, fiatValue, priceImpact, showMaxButton, field }: TokenSwapCardProps) => {

    const { address: account } = useAccount()

    const { data: balance, isLoading } = useBalance({ 
        address: account, 
        token: currency?.isNative ? undefined : currency?.wrapped.address as Address, 
        watch: true
    });

    const balanceString = useMemo(() => {
        if (isLoading || !balance) return "Loading...";

        const _balance = balance.formatted

        if (_balance.split(".")[0].length > 10) {
            return _balance.slice(0, 7) + "...";
        }

        if (+balance.formatted === 0) {
            return "0";
        }
        if (+balance.formatted < 0.0001) {
            return "< 0.0001";
        }

        return Number(balance.formatted).toFixed(3)
    }, [balance, isLoading]);

    return  <div className="flex bg-[#101321] p-3 rounded-2xl">
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
                <CurrencyLogo currency={currency} size={35} />
                <span className="font-bold text-lg">{currency ? currency.symbol : "Select a token"}</span>
        </div>
        {currency && account && (
            <div className={"flex text-sm whitespace-nowrap"}>
                <div>
                    <span className="font-bold">Balance: </span>
                    <span>{balanceString}</span>
                </div>
                {showMaxButton && (
                    <button className="ml-2 text-cyan-500" onClick={handleMaxValue}>
                        Max
                    </button>
                )}
            </div>
        )}
    </div>

    <div className="w-full">
        <Input value={value} id={`amount-${currency?.symbol}`} onChange={(e) => handleValueChange(e.target.value.trim())} className={`text-right border-none text-xl font-bold`} placeholder={'0.0'} />
        {/* {currency && value && <div className="token-swap-card__fiat">{value && <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />}</div>} */}
        {/* {fiatValue?.toSignificant()} */}
    </div>
</div>

}

export default TokenCard;