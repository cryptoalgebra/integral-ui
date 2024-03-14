import CurrencyLogo from '@/components/common/CurrencyLogo';
import PageTitle from '@/components/common/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPercent } from '@/utils/common/formatPercent';
import { Pool } from '@cryptoalgebra/integral-sdk';

interface PoolHeaderProps {
    pool: Pool | null;
}

const PoolHeader = ({ pool }: PoolHeaderProps) => {
    const [token0, token1] = pool ? [pool.token0, pool.token1] : [];

    const poolFee = pool && formatPercent.format(pool.fee / 10_00000);

    return (
        <div className="flex w-full gap-8">
            <div className="flex">
                <CurrencyLogo currency={token0} size={40} />
                <CurrencyLogo currency={token1} size={40} className="-ml-2" />
            </div>

            {token0 && token1 ? (
                <PageTitle title={`${token0.symbol} / ${token1.symbol}`}>
                    <span className="hidden sm:inline px-3 py-2 bg-muted-primary text-primary-text font-semibold rounded-2xl">{`${poolFee}`}</span>
                </PageTitle>
            ) : (
                <Skeleton className="w-[200px] h-[40px] bg-card" />
            )}
        </div>
    );
};

export default PoolHeader;
