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
    <section className='border rounded-lg p-3'>
      <div className='mb-3 flex items-center justify-between gap-3'>
        <div>
          <h4 className='text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted'>Liquidity</h4>
          {/* <p className='text-xs text-text-muted'>Deposited assets</p> */}
        </div>
        <span className='text-base font-medium text-text'>${formatAmount(totalUsd || 0, 4)}</span>
      </div>

      <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
        <div className='flex items-center gap-3 rounded-lg bg-panel p-2'>
          <CurrencyLogo currency={token0} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='truncate text-sm font-medium text-text'>
              {formatAmount(amount0 || 0, 6)} {token0?.symbol}
            </span>
            <span className='text-xs text-text-muted'>${formatAmount(amount0Usd || 0, 4)}</span>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-lg bg-panel p-2'>
          <CurrencyLogo currency={token1} size={32} className='shrink-0' />
          <div className='flex flex-col min-w-0'>
            <span className='truncate text-sm font-medium text-text'>
              {formatAmount(amount1 || 0, 6)} {token1?.symbol}
            </span>
            <span className='text-xs text-text-muted'>${formatAmount(amount1Usd || 0, 4)}</span>
          </div>
        </div>
      </div>

      <div className=''>
        <TokenRatio mintInfo={mintInfo} />
      </div>
    </section>
  );
}
