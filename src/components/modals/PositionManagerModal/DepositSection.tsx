import CurrencyLogo from '@/components/common/CurrencyLogo';
import TokenRatio from '@/components/create-position/TokenRatio';
import { useUSDCValue } from '@/hooks/common/useUSDCValue';
import { IDerivedMintInfo } from '@/state/mintStore';
import { formatAmount } from '@/utils';
import type { Currency, Position } from '@cryptoalgebra/integral-sdk';

interface DepositSectionProps {
  position: Position | undefined;
  token0: Currency | undefined;
  token1: Currency | undefined;
  mintInfo: IDerivedMintInfo;
}

export function DepositSection({ position, token0, token1, mintInfo }: DepositSectionProps) {
  const amount0 = position?.amount0.toSignificant(24);
  const amount1 = position?.amount1.toSignificant(24);

  const { formatted: amount0Usd } = useUSDCValue(position?.amount0);
  const { formatted: amount1Usd } = useUSDCValue(position?.amount1);

  const totalUsd = (amount0Usd || 0) + (amount1Usd || 0);

  return (
    <div className='p-4 border border-card-border rounded-xl'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h4 className='text-sm font-medium text-text'>Liquidity</h4>
          <p className='text-xs text-text/50'>Deposited assets</p>
        </div>
        <div className='text-right'>
          <span className='text-lg font-medium'>${formatAmount(totalUsd || 0, 4)}</span>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-3 mb-3'>
        {/* Token A */}
        <div className='flex items-center gap-3 p-3 rounded-lg bg-card-hover/50'>
          <CurrencyLogo currency={token0} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='text-base font-medium text-text truncate'>
              {formatAmount(amount0 || 0, 6)} {token0?.symbol}
            </span>
            <span className='text-xs text-text/50'>${formatAmount(amount0Usd || 0, 4)}</span>
          </div>
        </div>

        {/* Token B */}
        <div className='flex items-center gap-3 p-3 rounded-lg bg-card-hover/50'>
          <CurrencyLogo currency={token1} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='text-base font-medium text-text truncate'>
              {formatAmount(amount1 || 0, 6)} {token1?.symbol}
            </span>
            <span className='text-xs text-text/50'>${formatAmount(amount1Usd || 0, 4)}</span>
          </div>
        </div>
      </div>

      <div className='p-2 rounded-lg bg-card-hover/50'>
        <TokenRatio mintInfo={mintInfo} />
      </div>
    </div>
  );
}
