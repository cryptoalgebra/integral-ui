import CurrencyLogo from '@/components/common/CurrencyLogo';
import { Skeleton } from '@/components/ui/skeleton';
import { useSingleTokenQuery } from '@/graphql/generated/graphql';
import { useSwapState } from '@/state/swapStore';
import { Currency } from '@cryptoalgebra/integral-sdk';
import { useEffect, useState } from 'react';
import { Address } from 'viem';

interface ISummary {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
}

const Summary = ({ currencyA, currencyB }: ISummary) => {
    const [suggestedPrice, setSuggestedPrice] = useState(0);
    const { typedValue } = useSwapState();

    const token0 = currencyA?.wrapped.address.toLowerCase() as Address;
    const token1 = currencyB?.wrapped.address.toLowerCase() as Address;

    const { data: singleToken0 } = useSingleTokenQuery({
        variables: {
            tokenId: token0,
        },
        skip: !token0,
    });

    const { data: singleToken1 } = useSingleTokenQuery({
        variables: {
            tokenId: token1,
        },
        skip: !token1,
    });
    useEffect(() => {
        if (!singleToken0?.token || !singleToken1?.token) return;
        if (
            Number(singleToken0.token.derivedMatic) === 0 ||
            Number(singleToken1.token.derivedMatic) === 0
        ) {
            setSuggestedPrice(0);
            return;
        }

        const suggstdPrice =
            singleToken1.token.derivedMatic / singleToken0.token.derivedMatic;
        const filteredSuggstdPrice = Number(suggstdPrice.toFixed(4));

        setSuggestedPrice(filteredSuggstdPrice);
    }, [singleToken0, singleToken1]);

    return (
        <div className="flex flex-col gap-4 bg-card-dark py-2 px-3 rounded-lg">
            <div className="flex items-center gap-4 ml-2 justify-between">
                <div className="flex">
                    <CurrencyLogo currency={currencyA} size={30} />
                    <CurrencyLogo
                        currency={currencyB}
                        size={30}
                        className="-ml-2"
                    />
                </div>

                {currencyA && currencyB ? (
                    <div className="mr-auto">{`${currencyA?.symbol} - ${currencyB?.symbol}`}</div>
                ) : (
                    <Skeleton className="h-[20px] w-[90px] bg-card" />
                )}

                <div>
                    {`1 ${currencyB?.symbol} = ${typedValue || 0} ${
                        currencyA?.symbol
                    }`}
                </div>
            </div>
            {suggestedPrice > 0 && (
                <div className="text-left ml-2 flex justify-between">
                    <p className="opacity-50">Suggested price:</p>
                    <p className="opacity-50">{` 1 ${currencyB?.symbol} = ${suggestedPrice} ${currencyA?.symbol}`}</p>
                </div>
            )}
        </div>
    );
};

export default Summary;
