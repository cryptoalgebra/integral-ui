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

        return balance.formatted
    }, [balance, isLoading]);

    return  <div className="flex">
    <div className="flex flex-col">
        <div className="token-card-selector">
            <button className="token-swap-card-selector__btn f f-ac f-jb">
                <div className="token-swap-card-selector__logo">
                    {/* <CurrencyLogo size={"24px"} currency={currency as WrappedCurrency}></CurrencyLogo> */}
                </div>
                <span>{currency ? currency.symbol : "Select a token"}</span>
                <span className="token-swap-card-selector__btn-chevron">
                    {/* <ChevronRight size={18} /> */}
                </span>
            </button>
        </div>
        {currency && account && (
            <div className={"f token-swap-card__balance mt-1 f-ac"}>
                <div>{`Balance: ${balanceString}`}</div>
                {showMaxButton && (
                    <button className="token-swap-card__max-button ml-05" onClick={handleMaxValue}>
                        Max
                    </button>
                )}
            </div>
        )}
    </div>

    <div className="f c w-100">
        <Input value={value} id={`amount-${currency?.symbol}`} onChange={(e) => handleValueChange(e.target.value.trim())} className={`token-swap-card-input`} placeholder={"0"} />
        {/* {currency && value && <div className="token-swap-card__fiat">{value && <FiatValue fiatValue={fiatValue} priceImpact={priceImpact} />}</div>} */}
    </div>
</div>

}

export default TokenCard;