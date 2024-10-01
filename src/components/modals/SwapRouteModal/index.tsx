import {
  Credenza,
  CredenzaBody,
  CredenzaClose,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
  CredenzaTrigger,
} from "@/components/ui/credenza";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { ArrowRight } from "lucide-react";
import { Address, useAccount } from "wagmi";
import {
  CUSTOM_POOL_BASE,
  CUSTOM_POOL_DEPLOYER_BLANK,
  CUSTOM_POOL_DEPLOYER_FEE_CHANGER,
} from "@/constants/addresses";
import { MAX_UINT128 } from "@/constants/max-uint128";
import { useCurrency } from "@/hooks/common/useCurrency";
import { ALGEBRA_ROUTER } from "@/constants/addresses"
import { useMemo } from "react";
import {
  Route,
  Currency,
  Pool,
} from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { useAlgebraPoolPlugin, usePrepareAlgebraBasePluginBeforeSwap } from "@/generated"
import { TradeType } from "@cryptoalgebra/custom-pools-sdk";

interface ISwapRouteModal {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  routes: Route[] | undefined;
  tradeType: TradeType;
  children: React.ReactNode;
}

const customPoolDeployers = {
  [CUSTOM_POOL_BASE]: "Base",
  [CUSTOM_POOL_DEPLOYER_BLANK]: "Blank",
  [CUSTOM_POOL_DEPLOYER_FEE_CHANGER]: "Fee Changer",
};

const RoutePool = ({
  pool,
  amountIn,
  amountOut,
  tradeType
}: {
  pool: { path: Currency[]; address: Address; deployer: Address; fee: number; };
  amountIn: bigint,
  amountOut: bigint,
  tradeType: TradeType
}) => {
  const [token0, token1] = [pool.path[0], pool.path[1]];
  const currencyA = useCurrency(token0.wrapped.address as Address, true);
  const currencyB = useCurrency(token1.wrapped.address as Address, true);

  const deployer = customPoolDeployers[pool.deployer.toLowerCase()];

  const isZeroToOne = token0.wrapped.sortsBefore(token1.wrapped)

  const { address: recipient } = useAccount()

  const { data: plugin } = useAlgebraPoolPlugin({
    address: pool.address
  })

  const { data: beforeSwap } = usePrepareAlgebraBasePluginBeforeSwap({
    account: pool.address,
    address: plugin,
    args: recipient ? [
      ALGEBRA_ROUTER,
      recipient,
      isZeroToOne,
      tradeType === TradeType.EXACT_INPUT ? amountIn : amountOut,
      MAX_UINT128,
      false,
      '0x'
    ] : undefined,
  })

  const [, overrideFee, pluginFee] = beforeSwap?.result || ['', 0, 0]

  const fee = overrideFee ? overrideFee : pool.fee

  return (
    <div className={"w-full flex items-center justify-between py-2"}>
      <div className={"flex flex-1 flex-col gap-2 items-start"}>
        <CurrencyLogo currency={currencyA} size={20} />
        <span className={"font-bold"}>{currencyA?.symbol}</span>
      </div>
      <div className={"flex flex-2 flex-col gap-2 items-center"}>
        <ArrowRight size={"16px"} />
        <span>{`${deployer} ${currencyA?.symbol}/${currencyB?.symbol} (${fee / 10_000}% + ${pluginFee / 10_000}%)`}</span>
      </div>
      <div className={"flex flex-1 flex-col gap-2 items-end"}>
        <CurrencyLogo currency={currencyB} size={20} />
        <span className={"font-bold"}>{currencyB?.symbol}</span>
      </div>
    </div>
  );
};

const RouteSplit = ({
  route,
  tradeType
}: {
  route: { pools: Pool[]; path: Currency[]; percent: number; amountInList?: bigint[]; amountOutList?: bigint[] };
  tradeType: TradeType
}) => {
  const splits = useMemo(() => {
    const split = [];

    for (let idx = 0; idx < Math.ceil(route.path.length / 2); idx++) {
      split[idx] = [route.path[idx], route.path[idx + 1]];
    }

    return split;
  }, [route]);

  return (
    <div className={"px-4 py-3 rounded-xl bg-gray-800"}>
      {route.percent < 100 && (
        <div
          className={"pb-2 border-b border-gray-600 font-bold"}
        >{`Split ${route.percent}%`}</div>
      )}
      {route.pools.map((pool, idx) =>
        pool.type === 1 ? (
          <RoutePool
            pool={{
              path: splits[idx],
              fee: pool.fee,
              address: pool.address,
              deployer: pool.deployer
            }}
            amountIn={route.amountInList?.[idx] || 0n}
            amountOut={route.amountOutList?.[idx] || 0n}
            tradeType={tradeType}
          />
        ) : null
      )}
    </div>
  );
};

const SwapRouteModal = ({
  isOpen,
  setIsOpen,
  routes,
  tradeType,
  children,
}: ISwapRouteModal) => {
  if (!routes) return null;

  return (
    <Credenza open={isOpen}>
      <CredenzaTrigger asChild>{children}</CredenzaTrigger>
      <CredenzaContent
        className="bg-card-dark !rounded-3xl"
        onInteractOutside={() => setIsOpen(false)}
        onEscapeKeyDown={() => setIsOpen(false)}
      >
        <CredenzaHeader>
          <CredenzaTitle>Route</CredenzaTitle>
        </CredenzaHeader>
        <CredenzaBody className={"flex flex-col gap-4"}>
          {routes.map((route) => (
            <RouteSplit
              key={`route-split-${route.path.join("-")}`}
              route={route}
              tradeType={tradeType}
            />
          ))}
        </CredenzaBody>
        <CredenzaClose asChild>
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70"
            onClick={() => setIsOpen(false)}
            style={{ zIndex: 999 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </CredenzaClose>
      </CredenzaContent>
    </Credenza>
  );
};

export default SwapRouteModal;
