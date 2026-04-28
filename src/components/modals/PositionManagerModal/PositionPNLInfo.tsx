import { useState, useEffect, useRef } from 'react';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import type { Currency } from '@cryptoalgebra/integral-sdk';
import { TrendingUp } from 'lucide-react';
import { cn, formatAmount } from '@/utils';
import CurrencyLogo from '@/components/common/CurrencyLogo';
import { PositionAnalytics, TokenValue } from '@/hooks/positions/usePositionAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

function Row({
  token0,
  token1,
  label,
  usdValue,
  value0,
  value1,
  positive,
  isPercent,
  view,
}: {
  token0: Currency;
  token1: Currency;
  label: string;
  usdValue: number;
  value0: number;
  value1: number;
  positive?: boolean;
  isPercent?: boolean;
  view: 'usd' | 'token0' | 'token1';
}) {
  const usdText = `${usdValue >= 0 ? (positive ? '+' : '') : '-'}${isPercent ? '' : '$'}${formatAmount(
    Math.abs(usdValue),
    4,
  )}${isPercent ? '%' : ''}`;
  const value0Text = `${value0 >= 0 ? (positive ? '+' : '') : '-'}${formatAmount(
    Math.abs(value0),
    4,
  )}${isPercent ? '%' : ''}`;
  const value1Text = `${value1 >= 0 ? (positive ? '+' : '') : '-'}${formatAmount(
    Math.abs(value1),
    4,
  )}${isPercent ? '%' : ''}`;

  const isFees = label === 'Earned fees';
  const isPNL = label === 'Unrealized PnL';

  return (
    <div className='flex w-full gap-4'>
      <span className={isFees ? 'text-primary' : 'opacity-50'}>{label}</span>
      {view === 'usd' && (
        <div
          className={`ml-auto flex items-center justify-end ${positive ? (usdValue >= 0 ? 'text-green-400' : 'text-text/60') : ''}`}
        >
          {usdText}
        </div>
      )}
      {view === 'token0' && (
        <div
          className={cn(
            'ml-auto flex items-center justify-end gap-1 text-xs',
            (isPercent || isPNL) && value0 >= 0
              ? 'text-green-400'
              : value0 < 0
                ? 'text-text/60'
                : '',
          )}
        >
          {!isPercent && <CurrencyLogo size={16} currency={token0} />}
          {value0Text}
        </div>
      )}
      {view === 'token1' && (
        <div
          className={cn(
            'ml-auto flex items-center justify-end gap-1 text-xs',
            (isPercent || isPNL) && value1 >= 0
              ? 'text-green-400'
              : value1 < 0
                ? 'text-text/60'
                : '',
          )}
        >
          {!isPercent && <CurrencyLogo size={16} currency={token1} />}
          {value1Text}
        </div>
      )}
    </div>
  );
}

export function PositionPNLInfo({
  token0,
  token1,
  positionAnalytics,
}: {
  token0: Currency | null | undefined;
  token1: Currency | null | undefined;
  positionAnalytics: PositionAnalytics | undefined;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!isMobile) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line consistent-return
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const [currentView, setCurrentView] = useState<'usd' | 'token0' | 'token1'>('usd');

  if (!positionAnalytics || !token0 || !token1)
    return (
      <div className='flex flex-col w-full gap-1 rounded-lg group p-3 hover:bg-card-hover/60 cursor-pointer transition-all duration-200 bg-card-hover/50 border border-card-border'>
        <div className='flex items-center justify-between'>
          <span className='text-text/50 uppercase tracking-wider text-xs'>Performance</span>
          <TrendingUp className='w-3.5 h-3.5 text-text/40' />
        </div>
        <div className='flex items-center gap-1'>
          <Skeleton className='h-6 w-20 rounded-md bg-card-hover' />
        </div>
      </div>
    );

  const {
    initialAmount,
    currentAmount,
    withdrawnAmount,
    collectedFees,
    pendingFees,
    il,
    pnl,
    roi,
  } = positionAnalytics;

  const summary: TokenValue = {
    usdValue:
      currentAmount.usdValue +
      collectedFees.usdValue +
      pendingFees.usdValue +
      withdrawnAmount.usdValue,
    value0:
      currentAmount.value0 + collectedFees.value0 + pendingFees.value0 + withdrawnAmount.value0,
    value1:
      currentAmount.value1 + collectedFees.value1 + pendingFees.value1 + withdrawnAmount.value1,
  };

  const pnlTrend =
    pnl?.usdValue !== undefined
      ? pnl.usdValue > 0
        ? 'up'
        : pnl.usdValue < 0
          ? 'down'
          : 'neutral'
      : undefined;

  return (
    <HoverCard
      open={isMobile ? isOpen : undefined}
      onOpenChange={(open) => !isMobile && setIsOpen(open)}
      openDelay={200}
      closeDelay={200}
    >
      <div ref={cardRef}>
        <HoverCardTrigger onClick={() => isMobile && setIsOpen(!isOpen)} asChild>
          <div className='flex flex-col gap-1 rounded-lg group p-3 hover:bg-card-hover/60 cursor-pointer transition-all duration-200 bg-card-hover/50 border border-card-border'>
            <div className='flex items-center justify-between'>
              <span className='text-text/50 uppercase tracking-wider text-xs'>Performance</span>
              <TrendingUp className='w-3.5 h-3.5 text-text/40' />
            </div>
            <span
              className={cn(
                'text-lg font-medium',
                pnlTrend === 'up'
                  ? 'text-green-500'
                  : pnlTrend === 'down'
                    ? 'text-text/50'
                    : 'text-text',
              )}
            >
              {pnlTrend === 'up' ? '+' : ''}${formatAmount(pnl.usdValue, 4)}
            </span>
          </div>
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent side={'bottom'} className='w-fit min-w-64 max-w-80 text-sm'>
            <p className='max-w-56 text-left text-xs opacity-50'>
              Detailed view of your position’s financial results, highlighting growth, fees earned,
              temporary losses, and overall profitability.
            </p>
            <p className='text-left text-xs opacity-50'>View results in:</p>
            <div className='flex h-fit w-fit justify-between gap-0.5 rounded-lg border border-lighter p-0.5'>
              <Button
                className='h-4 w-full rounded-md p-3 text-xs font-normal max-sm:p-3.5'
                variant={currentView === 'usd' ? 'iconActive' : 'icon'}
                onClick={() => setCurrentView('usd')}
              >
                <span>$ USD</span>
              </Button>
              <Button
                className='h-4 w-full gap-2 rounded-md p-3 text-xs font-normal max-sm:p-3.5'
                variant={currentView === 'token0' ? 'iconActive' : 'icon'}
                onClick={() => setCurrentView('token0')}
              >
                <CurrencyLogo currency={token0} size={16} /> {token0.symbol}
              </Button>
              <Button
                className='h-4 w-full gap-2 rounded-md p-3 text-xs font-normal max-sm:p-3.5'
                variant={currentView === 'token1' ? 'iconActive' : 'icon'}
                onClick={() => setCurrentView('token1')}
              >
                <CurrencyLogo currency={token1} size={16} /> {token1.symbol}
              </Button>
            </div>
            <div className='flex flex-col gap-2 rounded-lg bg-card-dark/50  p-2 text-xs'>
              <Row
                token0={token0}
                token1={token1}
                label='Initial deposit'
                view={currentView}
                {...initialAmount}
              />
              <Row
                token0={token0}
                token1={token1}
                label='Earned fees'
                view={currentView}
                {...pendingFees}
              />
              {collectedFees.usdValue > 0 && (
                <Row
                  token0={token0}
                  token1={token1}
                  label='Collected fees'
                  view={currentView}
                  {...collectedFees}
                />
              )}
              <Row
                token0={token0}
                token1={token1}
                label='Overall value'
                view={currentView}
                {...summary}
              />
              <hr className='border-card-border' />

              <Row
                token0={token0}
                token1={token1}
                label='Impermanent Loss'
                view={currentView}
                positive
                {...il}
              />

              <Row
                token0={token0}
                token1={token1}
                label='Unrealized PnL'
                view={currentView}
                positive
                {...pnl}
              />
              <Row
                token0={token0}
                token1={token1}
                label='ROI, %'
                view={currentView}
                positive
                isPercent
                {...roi}
              />
            </div>
          </HoverCardContent>
        </HoverCardPortal>
      </div>
    </HoverCard>
  );
}
