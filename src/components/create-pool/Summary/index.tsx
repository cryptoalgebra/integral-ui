import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useSingleTokenQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useMintState } from "@/state/mintStore";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { useEffect, useState } from "react";
import { Address } from "viem";

interface ISummary {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
}

const Summary = ({ currencyA, currencyB }: ISummary) => {
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const { startPriceTypedValue } = useMintState();

    const { infoClient } = useClients();

    const token0 = currencyA?.wrapped.address.toLowerCase() as Address;
    const token1 = currencyB?.wrapped.address.toLowerCase() as Address;

    const { data: singleToken0 } = useSingleTokenQuery({
        variables: {
            tokenId: token0,
        },
        skip: !token0,
        client: infoClient,
    });

    const { data: singleToken1 } = useSingleTokenQuery({
        variables: {
            tokenId: token1,
        },
        skip: !token1,
        client: infoClient,
    });
    useEffect(() => {
        if (!singleToken0?.token || !singleToken1?.token || !currencyA || !currencyB) return;
        if (Number(singleToken0.token.derivedMatic) === 0 || Number(singleToken1.token.derivedMatic) === 0) {
            setSuggestedPrice(0);
            return;
        }

        const suggstdPrice = Number(singleToken0.token.derivedMatic) / Number(singleToken1.token.derivedMatic);

        const filteredSuggstdPrice = Number(suggstdPrice.toFixed(4));

        setSuggestedPrice(filteredSuggstdPrice);
    }, [currencyA, currencyB, singleToken0, singleToken1]);

    return (
        <div className="flex flex-col gap-2 rounded-xl bg-card-light px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="flex">
                        <CurrencyLogo currency={currencyA} size={24} />
                        <CurrencyLogo currency={currencyB} size={24} className="-ml-2" />
                    </div>

                    {currencyA && currencyB ? (
                        <div className="truncate text-sm font-medium text-text">{`${currencyA?.symbol} / ${currencyB?.symbol}`}</div>
                    ) : (
                        <Skeleton className="h-[20px] w-[90px] bg-card" />
                    )}
                </div>

                <div className="text-sm text-text">{`1 ${currencyA?.symbol} = ${startPriceTypedValue || 0} ${currencyB?.symbol}`}</div>
            </div>

            {suggestedPrice > 0 && (
                <div className="flex items-center justify-between text-sm text-text-300">
                    <p>Suggested price</p>
                    <p>{`1 ${currencyA?.symbol} = ${suggestedPrice} ${currencyB?.symbol}`}</p>
                </div>
            )}
        </div>
    );
};

export default Summary;
