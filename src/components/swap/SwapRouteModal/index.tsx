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
import { Address } from "viem";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useMemo } from "react";
import { Route as SmartRoute, V3Pool } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { Currency, TradeType, Route as SDKRoute, BoostedRoute, BoostedRouteStepType } from "@cryptoalgebra/custom-pools-sdk";
import { customPoolDeployerTitleByAddress } from "config";
import { formatAmount } from "@/utils";

interface ISwapRouteModal {
    isOpen: boolean;
    setIsOpen: (state: boolean) => void;
    routes: SmartRoute[] | SDKRoute<Currency, Currency>[] | BoostedRoute<Currency, Currency>[] | undefined;
    fees: number[][];
    tradeType: TradeType;
    children: React.ReactNode;
}

const RoutePool = ({ pool }: { pool: { path: Currency[]; address: Address; deployer: Address; fee: number } }) => {
    const [token0, token1] = [pool.path[0], pool.path[1]];
    const currencyA = useCurrency(token0.wrapped.address as Address, true);
    const currencyB = useCurrency(token1.wrapped.address as Address, true);

    const deployer = customPoolDeployerTitleByAddress[pool.deployer.toLowerCase() as Address];

    return (
        <div className={"w-full flex items-center justify-between py-2"}>
            <div className={"flex flex-1 flex-col gap-2 items-start"}>
                <CurrencyLogo currency={currencyA} size={24} />
                <span className={"font-bold"}>{currencyA?.symbol}</span>
            </div>
            <div className={"flex flex-2 flex-col gap-2 items-center"}>
                <ArrowRight size={"16px"} />
                <span>{`${deployer} ${currencyA?.symbol}/${currencyB?.symbol} (${formatAmount(pool.fee / 10_000, 4)}%)`}</span>
            </div>
            <div className={"flex flex-1 flex-col gap-2 items-end"}>
                <CurrencyLogo currency={currencyB} size={24} />
                <span className={"font-bold"}>{currencyB?.symbol}</span>
            </div>
        </div>
    );
};

// Component for SDK Route (multihop through pools)
const SDKRouteDisplay = ({ route, fees }: { route: SDKRoute<Currency, Currency>; fees: number[] }) => {
    return route.pools.map((_, idx) => {
        const token0 = route.tokenPath[idx];
        const token1 = route.tokenPath[idx + 1];
        const fee = fees[idx] || 0;

        return <RouteHop key={`hop-${idx}`} token0={token0} token1={token1} fee={fee} />;
    });
};

// Component for single hop in route
const RouteHop = ({ token0, token1, fee, type }: { token0: Currency; token1: Currency; fee: number; type?: string }) => {
    const currencyA = useCurrency(token0.wrapped.address as Address, true);
    const currencyB = useCurrency(token1.wrapped.address as Address, true);

    const label = type === "wrap" ? `Wrap to ${currencyB?.symbol}` : type === "unwrap" ? `Unwrap to ${currencyB?.symbol}` : undefined;

    return (
        <div className={"w-full flex items-center justify-between border border-card-border p-4 rounded-lg"}>
            <div className={"flex flex-1 flex-col gap-2 items-start"}>
                <CurrencyLogo currency={currencyA} size={24} />
                <span className={"font-bold"}>{currencyA?.symbol}</span>
            </div>
            <div className={"flex flex-2 flex-col gap-2 items-center text-center"}>
                <ArrowRight size={"16px"} />
                {label ? (
                    <span>{label}</span>
                ) : (
                    <span>{`Swap ${currencyA?.symbol}/${currencyB?.symbol} (${formatAmount(fee / 10_000, 4)}%)`}</span>
                )}
            </div>
            <div className={"flex flex-1 flex-col gap-2 items-end"}>
                <CurrencyLogo currency={currencyB} size={24} />
                <span className={"font-bold"}>{currencyB?.symbol}</span>
            </div>
        </div>
    );
};

// Component for BoostedRoute (with wrap/unwrap steps)
const BoostedRouteDisplay = ({ route, fees }: { route: BoostedRoute<Currency, Currency>; fees: number[] }) => {
    const stepsWithFees = useMemo(() => {
        let poolIndex = 0;

        return route.steps.map((step) => {
            if (step.type === BoostedRouteStepType.SWAP) {
                const fee = fees[poolIndex] || 0;
                poolIndex++;
                return { step, fee };
            }
            return { step, fee: 0 };
        });
    }, [route.steps, fees]);

    return stepsWithFees.map(({ step, fee }, idx) => {
        const type = step.type === BoostedRouteStepType.WRAP ? "wrap" : step.type === BoostedRouteStepType.UNWRAP ? "unwrap" : undefined;

        return <RouteHop key={`step-${idx}`} token0={step.tokenIn} token1={step.tokenOut} fee={fee} type={type} />;
    });
};

const RouteSplit = ({ route, fees }: { route: SmartRoute; fees: number[][]; tradeType: TradeType }) => {
    const { splits, splitFees } = useMemo(() => {
        const splits = [];
        const splitFees = [];

        for (let idx = 0; idx <= Math.ceil(route.path.length / 2); idx++) {
            splits[idx] = [route.path[idx], route.path[idx + 1]];
            splitFees[idx] = fees[idx];
        }

        return {
            splits,
            splitFees: splitFees.flat(),
        };
    }, [route, fees]);

    return (
        <div className={"px-4 py-3 rounded-xl bg-card-dark/80 border border-card-border"}>
            {route.percent < 100 && (
                <div className={"pb-2 border-b border-card-border font-bold"}>{`Split ${formatAmount(route.percent, 2)}%`}</div>
            )}
            {route.pools.map((pool, idx) =>
                pool.type === 1 ? (
                    <RoutePool
                        key={`route-pool-${idx}`}
                        pool={{
                            path: splits[idx] as any,
                            fee: splitFees[idx],
                            address: pool.address,
                            deployer: pool.deployer,
                        }}
                    />
                ) : null
            )}
        </div>
    );
};

export const SwapRouteModal = ({ isOpen, setIsOpen, routes, fees, tradeType, children }: ISwapRouteModal) => {
    if (!routes) return null;

    // Determine route type
    const isSmartRoute = routes.length > 0 && "percent" in routes[0];
    const isBoostedSDKRoute = !isSmartRoute && routes.length > 0 && (routes[0] as BoostedRoute<Currency, Currency>).isBoosted;
    const isSDKRoute = routes.length > 0 && !isSmartRoute && !isBoostedSDKRoute && "pools" in routes[0];

    return (
        <Credenza open={isOpen}>
            <CredenzaTrigger asChild>{children}</CredenzaTrigger>
            <CredenzaContent
                className="bg-card !rounded-xl"
                onInteractOutside={() => setIsOpen(false)}
                onEscapeKeyDown={() => setIsOpen(false)}
            >
                <CredenzaHeader>
                    <CredenzaTitle>Route</CredenzaTitle>
                </CredenzaHeader>
                <CredenzaBody className={"flex flex-col gap-4 p-2"}>
                    {isSmartRoute &&
                        (routes as SmartRoute[]).map((route) => (
                            <RouteSplit
                                key={`route-split-${route.pools.map((pool) => (pool as V3Pool).address).join("-")}`}
                                route={route}
                                fees={fees}
                                tradeType={tradeType}
                            />
                        ))}
                    {isBoostedSDKRoute &&
                        (routes as BoostedRoute<Currency, Currency>[]).map((route, idx) => (
                            <BoostedRouteDisplay key={`boosted-route-${idx}`} route={route} fees={fees[idx] || []} />
                        ))}
                    {isSDKRoute &&
                        (routes as SDKRoute<Currency, Currency>[]).map((route, idx) => (
                            <SDKRouteDisplay key={`sdk-route-${idx}`} route={route} fees={fees[idx] || []} />
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
