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

  const zeroRewards = amount0?.equalTo('0') && amount1?.equalTo('0');

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
    <div className='p-4 border border-card-border rounded-xl'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h4 className='text-sm font-medium text-text'>Earned Fees</h4>
          <p className='text-xs text-text/50'>Available to collect</p>
        </div>
        <div className='text-right'>
          <span className='text-lg font-medium'>${formatAmount(totalUsd || 0, 4)}</span>
        </div>
      </div>

      {/* Token breakdown */}
      <div className='grid grid-cols-2 gap-3 mb-4'>
        {/* Token A */}
        <div className='flex items-center gap-3 p-3 rounded-lg bg-card-hover/50'>
          <CurrencyLogo currency={amount0?.currency} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='text-base font-medium text-text truncate'>
              {formatAmount(amount0?.toSignificant(24) || 0, 6)} {amount0?.currency?.symbol}
            </span>
            <span className='text-xs text-text/50'>${formatAmount(amount0Usd || 0, 4)}</span>
          </div>
        </div>
        {/* Token B */}
        <div className='flex items-center gap-3 p-3 rounded-lg bg-card-hover/50'>
          <CurrencyLogo currency={amount1?.currency} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='text-base font-medium text-text truncate'>
              {formatAmount(amount1?.toSignificant(24) || 0, 6)} {amount1?.currency?.symbol}
            </span>
            <span className='text-xs text-text/50'>${formatAmount(amount1Usd || 0, 4)}</span>
          </div>
        </div>
      </div>

      {/* Collect button */}
      <Button
        onClick={handleCollect}
        disabled={isCollecting || zeroRewards || !account}
        variant='primary'
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
    </div>
  );
}
