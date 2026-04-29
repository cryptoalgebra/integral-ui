
import type { Currency } from '@cryptoalgebra/integral-sdk';
import { Copy, ExternalLink, X } from 'lucide-react';
import { DialogClose } from '@/components/ui/dialog';
import { useBlockExplorerURL } from '@/hooks/common/useBlockExplorer';
import CurrencyLogo from '@/components/common/CurrencyLogo';
import { cn } from '@/utils';
import { PositionStatus } from '@/hooks/earn/useExtendedPositions';

interface PositionModalHeaderProps {
  token0: Currency | undefined;
  token1: Currency | undefined;
  positionId: number;
  poolFee: number;
  status: PositionStatus;
  onClose?: () => void;
}

export function PositionModalHeader({
  token0,
  token1,
  positionId,
  poolFee,
  status,
  onClose,
}: PositionModalHeaderProps) {
  const explorerUrl = useBlockExplorerURL();

  return (
    <div className='flex items-center justify-between'>
      {/* Left side - Token pair and position info */}
      <div className='flex items-center gap-4'>
        {/* Token pair logos */}
        <div className='relative'>
          <div className='flex items-center'>
            <CurrencyLogo currency={token0} size={40} className='ring-4 z-10 ring-card' />
            <CurrencyLogo currency={token1} size={40} className='-ml-3 ring-4 ring-card' />
          </div>
          {/* Range status dot */}
          <div
            className={cn(
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card',
              status === PositionStatus.OUT_OF_RANGE ? 'bg-yellow-500' : 'bg-green-500',
            )}
          />
        </div>

        {/* Position details */}
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <h2 className='text-xl font-bold text-text'>
              {token0?.symbol}/{token1?.symbol}
            </h2>
            <span className='px-2 py-0.5 text-xs font-medium bg-panel text-text rounded-md'>
              {(poolFee / 10_000).toFixed(2)}%
            </span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center text-sm text-text/50'>
              <span>#{positionId}</span>
            </div>
            <div className='flex items-center gap-1.5'>
              {/* <CopyToClipboard value={positionId}> */}
                <button type='button' className='p-1 rounded hover:bg-card-hover transition-colors'>
                  <Copy className='w-3.5 h-3.5 text-text/40' />
                </button>
              {/* </CopyToClipboard> */}
              <a
                target='_blank'
                href={`${explorerUrl}/${positionId}`}
                rel='noreferrer'
                className='p-1 rounded hover:bg-card-hover transition-colors'
              >
                <ExternalLink className='w-3.5 h-3.5 text-text/40' />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Status and close */}
      <div className='flex items-center gap-3'>
        {/* Range status badge */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
            status === PositionStatus.OUT_OF_RANGE
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              : 'bg-green-500/10 text-green-400 border border-green-500/30',
          )}
        >
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              status === PositionStatus.OUT_OF_RANGE ? 'bg-yellow-400 animate-pulse' : 'bg-green-400',
            )}
          />
          {status === PositionStatus.OUT_OF_RANGE ? 'Out of Range' : 'In Range'}
        </div>

        {/* Close button */}
        <DialogClose asChild>
          <button
            type='button'
            className='flex items-center justify-center w-9 h-9 rounded-xl bg-card-hover/50 hover:bg-card-hover transition-colors'
            onClick={onClose}
          >
            <X className='w-5 h-5 text-text/60' />
          </button>
        </DialogClose>
      </div>
    </div>
  );
}
