import CurrencyLogo from '@/components/common/CurrencyLogo';
import PageTitle from '@/components/common/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/common/useCurrency';
import { formatPercent } from '@/utils/common/formatPercent';
import { Pool } from '@cryptoalgebra/custom-pools-sdk';
import { Address } from 'viem';

interface PoolHeaderProps {
    pool: Pool | null;
}

const PoolHeader = ({ pool }: PoolHeaderProps) => {
    const [token0, token1] = pool ? [pool.token0, pool.token1] : [];

    const currencyA = useCurrency(token0?.address as Address, true);
    const currencyB = useCurrency(token1?.address as Address, true);

    const poolFee = pool && formatPercent.format(pool.fee / 10_00000);

    return (
        <div className="flex w-full gap-8">
            <div className="flex">
                <CurrencyLogo currency={currencyA} size={40} />
                <CurrencyLogo
                    currency={currencyB}
                    size={40}
                    className="-ml-2"
                />
            </div>

            {currencyA && currencyB ? (
                <PageTitle title={`${currencyA.symbol} / ${currencyB.symbol}`}>
                    <span className="hidden sm:inline px-3 py-2 bg-muted-primary text-primary-text font-semibold rounded-2xl">{`${poolFee}`}</span>
                </PageTitle>
            ) : (
                <Skeleton className="w-[200px] h-[40px] bg-card" />
            )}
        </div>
    );
};

export default PoolHeader;
