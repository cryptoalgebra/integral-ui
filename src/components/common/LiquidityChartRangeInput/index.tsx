import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { Chart } from './Chart';
import { useDensityChartData } from './hooks';
import { type ZoomLevels } from './types';
import { Bound, type Pool, type Price, type AnyToken } from '@cryptoalgebra/integral-sdk';
import Loader from '../Loader';
import { formatDelta } from '@/utils/common/formatDelta';


const DEFAULT_ZOOM_LEVELS: ZoomLevels = {
  initialMin: 0.9,
  initialMax: 1.1,
  min: 0.00001,
  max: 20,
};

const STABLE_ZOOM_LEVELS: ZoomLevels = {
  initialMin: 0.99,
  initialMax: 1.01,
  min: 0.00001,
  max: 20,
};

function InfoBox({ message, icon }: { message?: ReactNode; icon: ReactNode }) {
  return (
    <div className='flex w-full flex-col items-center justify-center text-black'>
      {icon}
      {message && <div className='p-10 text-center'>{message}</div>}
    </div>
  );
}

export default function LiquidityChartRangeInput({
  pool,
  ticksAtLimit,
  price,
  priceLower,
  priceUpper,
  minPrice24h,
  maxPrice24h,
  marketPrice,
  onLeftRangeInput,
  onRightRangeInput,
  interactive = true,
  isOnlyView = false,
  width = 360,
  height = 230,
  isSorted = true,
  isStable = false,
}: {
  // currencyA?: Token;
  // currencyB?: Token;
  pool: Pool | null | undefined;
  ticksAtLimit: { [bound in Bound]?: boolean | undefined };
  price?: number;
  minPrice24h?: number;
  maxPrice24h?: number;
  priceLower?: Price<AnyToken, AnyToken>;
  priceUpper?: Price<AnyToken, AnyToken>;
  marketPrice?: number;
  onLeftRangeInput?: (typedValue: string) => void;
  onRightRangeInput?: (typedValue: string) => void;
  interactive?: boolean;
  isOnlyView?: boolean;
  width?: number;
  height?: number;
  isSorted?: boolean;
  isStable?: boolean;
}) {
  const { isLoading: isChartLoading, formattedData } = useDensityChartData({
    pool,
    isSorted,
  });

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (formattedData?.length) {
      forceUpdate();
    }
  }, [formattedData]);

  const onBrushDomainChangeEnded = useCallback(
    (domain: [number, number], mode: string | undefined) => {
      let leftRangeValue = Number(domain[0]);
      const rightRangeValue = Number(domain[1]);

      if (leftRangeValue <= 0) {
        leftRangeValue = 1 / 10 ** 6;
      }

      // invert price
      // if (!isSorted) {
      //   leftRangeValue /= leftRangeValue ** 2;
      //   rightRangeValue /= rightRangeValue ** 2;
      // }

      // simulate user input for auto-formatting and other validations
      if (
        (!ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] ||
          mode === 'handle' ||
          mode === 'reset') &&
        leftRangeValue > 0
      ) {
        onLeftRangeInput?.(leftRangeValue.toFixed(12));
      }

      if (
        (!ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || mode === 'reset') &&
        rightRangeValue > 0
      ) {
        // todo: remove this check. Upper bound for large numbers
        // sometimes fails to parse to tick.
        // if (rightRangeValue < 1e35) {
        onRightRangeInput?.(rightRangeValue.toFixed(12));
        // }
      }
    },
    [isSorted, onLeftRangeInput, onRightRangeInput, ticksAtLimit],
  );

  const brushDomain: [number, number] | undefined = useMemo(() => {
    const lowPrice = isSorted
      ? priceLower?.toSignificant(6)
      : priceUpper?.invert().toSignificant(6);
    const highPrice = isSorted
      ? priceUpper?.toSignificant(6)
      : priceLower?.invert()?.toSignificant(6);
    return lowPrice && highPrice ? [parseFloat(lowPrice), parseFloat(highPrice)] : undefined;
  }, [priceLower?.toSignificant(6), priceUpper?.toSignificant(6), isSorted]);

  const brushLabelValue = useCallback(
    (d: 'w' | 'e', x: number) => {
      const _price = marketPrice || price;

      if (!_price) return '';

      if (d === 'w' && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0';
      if (d === 'e' && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞';

      const percent =
        (x < _price ? -1 : 1) * ((Math.max(x, _price) - Math.min(x, _price)) / _price) * 100;

      return _price ? `${(Math.sign(percent) < 0 ? '-' : '+') + formatDelta(percent)}` : '';
    },
    [isSorted, marketPrice, price, ticksAtLimit],
  );

  const ZOOM_LEVELS = useMemo(
    () => (isStable ? STABLE_ZOOM_LEVELS : DEFAULT_ZOOM_LEVELS),
    [isStable],
  );

  const mockData = useMemo(() => {
    if (!formattedData?.length && price)
      return [
        {
          activeLiquidity: 0,
          price0: price * ZOOM_LEVELS.initialMin,
          amount0: null,
          amount1: null,
          isCurrent: false,
        },
        {
          activeLiquidity: 0,
          price0: price * ZOOM_LEVELS.initialMax,
          amount0: null,
          amount1: null,
          isCurrent: false,
        },
      ];

    return [];
  }, [formattedData, price]);

  const mockPrice = useMemo(() => {
    if (!formattedData?.length && price) return price;

    return 0;
  }, [formattedData, price]);

  return (
    <div className='relative mb-4 flex' style={{ minHeight: '200px' }}>
      {isChartLoading ? (
        <InfoBox icon={<Loader size={40} />} />
      ) : (
        <Chart
          data={{
            series: formattedData?.length && price ? formattedData : mockData,
            current: marketPrice || (formattedData?.length && price ? price : mockPrice),
          }}
          dimensions={{ width, height }}
          margins={{ top: 50, right: 2, bottom: 20, left: 0 }}
          styles={{
            main: {
              primary: 'var(--primary-200)',
              accent: 'var(--accent-100)',
              secondary: 'var(--bg-100)',
              priceLine: 'var(--text-100)',
            },
            area: {
              selection: 'var(--primary-100)',
            },
            brush: {
              handleStroke: 'var(--text-100)',
              handleAccent: 'var(--text-100)',
              handleBg: 'var(--primary-100)',
            },
            tooltip: {
              primary: 'white',
              bg: 'var(--primary-200)',
            },
          }}
          interactive={interactive}
          brushLabels={brushLabelValue}
          brushDomain={brushDomain}
          onBrushDomainChange={onBrushDomainChangeEnded}
          zoomLevels={ZOOM_LEVELS}
          ticksAtLimit={ticksAtLimit}
          minPrice24h={minPrice24h}
          maxPrice24h={maxPrice24h}
          isMock={!formattedData?.length || !price}
          isOnlyView={isOnlyView}
        />
      )}
    </div>
  );
}
