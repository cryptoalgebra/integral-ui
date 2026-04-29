import type { Currency } from '@cryptoalgebra/integral-sdk';
import { PositionAPRInfo } from './PositionAPRInfo';
import { PositionPNLInfo } from './PositionPNLInfo';
import { PositionAgeInfo } from './PositionAgeInfo';
import { PositionAnalytics } from '@/hooks/positions/usePositionAnalytics';

export function MetrcisSection({
  token0,
  token1,
  positionAnalytics,
}: {
  token0: Currency | null | undefined;
  token1: Currency | null | undefined;
  positionAnalytics: PositionAnalytics | undefined;
}) {
  return (
    <section className="rounded-lg border p-3">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h4 className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">Metrics</h4>
                    {/* <p className="text-xs text-text-muted">Position analytics</p> */}
                </div>
            </div>
    <div className='grid w-full grid-cols-1 gap-2 sm:grid-cols-3'>
      
      <PositionAPRInfo token0={token0} token1={token1} positionAnalytics={positionAnalytics} />
      <PositionPNLInfo token0={token0} token1={token1} positionAnalytics={positionAnalytics} />
      <PositionAgeInfo positionAnalytics={positionAnalytics} />
    </div>
    </section>
  );
}
