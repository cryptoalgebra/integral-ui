import { HoverCardPortal } from "@radix-ui/react-hover-card";
import { type Currency } from "@cryptoalgebra/integral-sdk";
import { Percent } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";
import { PositionAnalytics } from "@/hooks/positions/usePositionAnalytics";
import { formatAmount } from "@/utils";

const metricCardClass =
  "group flex w-full cursor-pointer flex-col gap-1 rounded-lg bg-panel p-2 transition-colors duration-150 hover:bg-panel-hover";

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
  const isMobile = useMediaQuery("(max-width: 767px)");

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
      <div className={metricCardClass}>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] uppercase tracking-[0.14em] text-text-muted'>Realized APR</span>
          <Percent className='h-3 w-3 text-text-muted' />
        </div>
        <Skeleton className='h-5 w-20 rounded-md bg-card' />
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
      openDelay={120}
      closeDelay={120}
    >
      <div ref={cardRef}>
        <HoverCardTrigger onClick={() => isMobile && setIsOpen(!isOpen)} asChild>
          <div className={metricCardClass}>
            <div className='flex items-center justify-between'>
              <span className='text-[10px] uppercase tracking-[0.14em] text-text-muted'>Realized APR</span>
              <Percent className='h-3 w-3 text-text-muted' />
            </div>
            <span className='text-base font-medium text-text'>{formatAmount(apr, 2)}%</span>
          </div>
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent side='bottom' className='w-[250px] max-w-[90vw] gap-2 rounded-xl border border-border bg-card p-3 text-xs shadow-sm'>
            <p className='text-left text-[11px] text-text-muted'>
              APR (Annual Percentage Rate) is an estimate based on your current position and
              accumulated fees.
              <br />
              These values are approximate and may differ from actual results.
            </p>
            <div className='flex flex-col gap-1 rounded-lg border border-border bg-panel p-2.5 text-[11px]'>
              <div className='flex justify-between'>
                <span className='text-text-muted'>Initial deposit</span>
                <span>${formatAmount(initialAmount.usdValue, 4)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-primary-hover'>Earned fees</span>
                <span>${formatAmount(earnedFees, 4)}</span>
              </div>

              <hr className='my-1 border-border' />

              <div className='flex justify-between text-text-muted'>
                <span>Daily Percentage Rate</span>
                <span>{formatAmount(dailyApr, 2)}%</span>
              </div>
              <div className='flex justify-between text-text-muted'>
                <span>Daily earnings</span>
                <span>${formatAmount(dailyEarnings, 4)}</span>
              </div>

              <div className='mt-1 flex justify-between text-text-muted'>
                <span>Monthly Percentage Rate</span>
                <span>{formatAmount(monthlyApr, 2)}%</span>
              </div>
              <div className='flex justify-between text-text-muted'>
                <span>Monthly earnings</span>
                <span>${formatAmount(monthlyEarnings, 4)}</span>
              </div>

              <div className='mt-1 flex justify-between'>
                <span className='text-text-muted'>Annual Percentage Rate</span>
                <span>{formatAmount(apr, 2)}%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-text-muted'>Annual earnings</span>
                <span>${formatAmount(yearlyEarnings, 4)}</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCardPortal>
      </div>
    </HoverCard>
  );
}
