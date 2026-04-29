import CurrencyLogo from '@/components/common/CurrencyLogo';
import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { useWriteNonfungiblePositionManagerMulticall } from '@/generated';
import { useTransactionAwait } from '@/hooks/common/useTransactionAwait';
import { usePositionFees } from '@/hooks/positions/usePositionFees';
import { TransactionType } from '@/state/pendingTransactionsStore';
import { formatAmount } from '@/utils';
import { NonfungiblePositionManager, Pool } from '@cryptoalgebra/integral-sdk';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

interface FeesSectionProps {
  pool: Pool | null | undefined;
  positionId: number;
  onRefetch?: () => void;
}

export function FeesSection({ pool, positionId, onRefetch }: FeesSectionProps) {
  const { address: account } = useAccount();

  const { amount0, amount1, amount0Usd, amount1Usd, totalUsd } = usePositionFees(
    pool ?? undefined,
    positionId,
    true,
  );

  const zeroRewards = Boolean(amount0?.equalTo('0') && amount1?.equalTo('0'));

  const { calldata, value } = useMemo(() => {
    if (!account || !amount0 || !amount1) return { calldata: undefined, value: undefined };

    return NonfungiblePositionManager.collectCallParameters({
      tokenId: positionId.toString(),
      expectedCurrencyOwed0: amount0,
      expectedCurrencyOwed1: amount1,
      recipient: account,
    });
  }, [positionId, amount0, amount1, account]);

  const collectConfig = calldata
    ? {
        args: [calldata as `0x${string}`[]] as const,
        value: BigInt(value || 0),
      }
    : undefined;

  const {
    data: collectData,
    writeContract: collect,
    isPending,
  } = useWriteNonfungiblePositionManagerMulticall();

  const { isLoading } = useTransactionAwait(collectData, {
    title: 'Collect fees',
    tokenA: pool?.token0.address as Address,
    tokenB: pool?.token1.address as Address,
    type: TransactionType.POOL,
    callback: onRefetch,
  });

  const handleCollect = () => {
    if (collectConfig) {
      collect(collectConfig);
    }
  };

  const isCollecting = isPending || isLoading;

  return (
    <section className='border rounded-lg p-3'>

      <div className='mb-3 flex items-center justify-between gap-3'>
        <div>
          <h4 className='text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted'>Earned fees</h4>
          {/* <p className='text-xs text-text-muted'>Available to collect</p> */}
        </div>
        <span className='text-base font-medium text-text'>${formatAmount(totalUsd || 0, 4)}</span>
      </div>

      <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
        <div className='flex items-center gap-3 rounded-lg bg-panel p-2'>
          <CurrencyLogo currency={amount0?.currency} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='truncate text-sm font-medium text-text'>
              {formatAmount(amount0?.toSignificant(24) || 0, 6)} {amount0?.currency?.symbol}
            </span>
            <span className='text-xs text-text-muted'>${formatAmount(amount0Usd || 0, 4)}</span>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg bg-panel  p-2'>
          <CurrencyLogo currency={amount1?.currency} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='truncate text-sm font-medium text-text'>
              {formatAmount(amount1?.toSignificant(24) || 0, 6)} {amount1?.currency?.symbol}
            </span>
            <span className='text-xs text-text-muted'>${formatAmount(amount1Usd || 0, 4)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleCollect}
        disabled={isCollecting || zeroRewards || !account}
        variant='primary'
        size='md'
        className='w-full'
      >
        {isCollecting ? (
          <>
            <Loader size={18} />
            <span>Collecting...</span>
          </>
        ) : (
          <span>Collect Fees</span>
        )}
      </Button>
    </section>
  );
}
