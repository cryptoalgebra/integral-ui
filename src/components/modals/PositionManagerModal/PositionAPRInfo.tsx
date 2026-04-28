import { useState, useEffect, useRef } from 'react';
import { HoverCardPortal } from '@radix-ui/react-hover-card';
import { type Currency } from '@cryptoalgebra/integral-sdk';
import { Percent } from 'lucide-react';
import { PositionAnalytics } from '@/hooks/positions/usePositionAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { formatAmount } from '@/utils';

export function PositionAPRInfo({
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile]);

  if (!positionAnalytics || !token0 || !token1)
    return (
      <div className='flex flex-col w-full gap-1 rounded-lg group p-3 hover:bg-card-hover/60 cursor-pointer transition-all duration-200 bg-card-hover/50 border border-card-border'>
        <div className='flex items-center justify-between'>
          <span className='text-text/50 uppercase tracking-wider text-xs'>Realized APR</span>
          <Percent className='w-3.5 h-3.5 text-text/40' />
        </div>
        <div className='flex items-center gap-1'>
          <Skeleton className='h-6 w-20 rounded-md bg-card-hover' />
        </div>
      </div>
    );

  const { currentAmount, collectedFees, pendingFees, apr: aprs, initialAmount } = positionAnalytics;

  const apr = aprs.usdValue;
  const currentAmountUsd = currentAmount.usdValue;

  const dailyApr = apr / 365;
  const monthlyApr = apr / 12;

  const earnedFees = collectedFees.usdValue + pendingFees.usdValue;

  const dailyEarnings = (currentAmountUsd * dailyApr) / 100;
  const monthlyEarnings = (currentAmountUsd * monthlyApr) / 100;
  const yearlyEarnings = (currentAmountUsd * apr) / 100;

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
              <span className='text-text/50 uppercase tracking-wider text-xs'>Realized APR</span>
              <Percent className='w-3.5 h-3.5 text-text/40' />
            </div>
            <span className='text-lg font-medium'>{formatAmount(apr, 2)}%</span>
          </div>
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent side={'bottom'} className='w-64 max-w-64 text-sm'>
            <p className='text-left text-xs opacity-50'>
              APR (Annual Percentage Rate) is an estimate based on your current position and
              accumulated fees.
              <br />
              These values are approximate and may differ from actual results.
            </p>
            <div className='flex flex-col gap-1 rounded-lg bg-card-dark/50  p-2 text-xs'>
              <div className='flex justify-between'>
                <span className='opacity-50'>Initial deposit</span>
                <span>${formatAmount(initialAmount.usdValue, 4)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-primary'>Earned fees</span>
                <span>${formatAmount(earnedFees, 4)}</span>
              </div>

              <hr className='mt-1 border-lighter' />

              <div className='mt-1 flex justify-between opacity-50'>
                <span>Daily Percentage Rate</span>
                <span>{formatAmount(dailyApr, 2)}%</span>
              </div>
              <div className='flex justify-between opacity-50'>
                <span>Daily earnings</span>
                <span>${formatAmount(dailyEarnings, 4)}</span>
              </div>

              <div className='mt-1 flex justify-between opacity-50'>
                <span>Monthly Percentage Rate</span>
                <span>{formatAmount(monthlyApr, 2)}%</span>
              </div>
              <div className='flex justify-between opacity-50'>
                <span>Monthly earnings</span>
                <span>${formatAmount(monthlyEarnings, 4)}</span>
              </div>

              <div className='mt-1 flex justify-between'>
                <span className='opacity-50'>Annual Percentage Rate</span>
                <span>{formatAmount(apr, 2)}%</span>
              </div>
              <div className='flex justify-between'>
                <span className='opacity-50'>Annual earnings</span>
                <span>${formatAmount(yearlyEarnings, 4)}</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCardPortal>
      </div>
    </HoverCard>
  );
}
