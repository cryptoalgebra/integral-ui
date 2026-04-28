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
    <div className='grid grid-cols-3 w-full gap-3'>
      <PositionAPRInfo token0={token0} token1={token1} positionAnalytics={positionAnalytics} />
      <PositionPNLInfo token0={token0} token1={token1} positionAnalytics={positionAnalytics} />
      <PositionAgeInfo positionAnalytics={positionAnalytics} />
    </div>
  );
}
