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
        <div className="rounded-lg p-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex shrink-0">
                        <CurrencyLogo currency={currencyA} size={28} />
                        <CurrencyLogo currency={currencyB} size={28} className="-ml-2" />
                    </div>

                    {currencyA && currencyB ? (
                        <p className="text-sm font-semibold text-text">{`${currencyA.symbol} / ${currencyB.symbol}`}</p>
                    ) : (
                        <Skeleton className="h-10 w-28 rounded-md bg-card" />
                    )}
                </div>

                <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-text">{`1 ${currencyA?.symbol} = ${startPriceTypedValue || 0} ${
                        currencyB?.symbol
                    }`}</p>
                </div>
            </div>

            {suggestedPrice > 0 && (
                <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-text-muted">Market</p>
                    <p className="font-medium text-text">{`1 ${currencyA?.symbol} = ${suggestedPrice} ${currencyB?.symbol}`}</p>
                </div>
            )}
        </div>
    );
};

export default Summary;
