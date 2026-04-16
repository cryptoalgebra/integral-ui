import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useNow } from "@/hooks/common/useNow";
import PredictionModule from "@/modules/PredictionModule";
import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { Address } from "viem";
import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";
import { useCurrency } from "@/hooks/common/useCurrency";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

const { useAllOpenMarkets, useUserMarkets } = PredictionModule.hooks;
const { PredictionMarketCard } = PredictionModule.components;

type StatusFilter = "all" | "open" | "closed";

export function PredictionsPage() {
    const { address: account } = useAccount();
    const now = useNow();

    const { data: poolMarkets, loading: poolMarketsLoading } = useAllOpenMarkets();
    const {
        data: { closedMarkets, openedMarkets },
        loading: userMarketsLoading,
    } = useUserMarkets(account);

    const isLoading = poolMarketsLoading || userMarketsLoading;

    const [tokenFilter, setTokenFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const tokenOptions = useMemo(() => {
        const seen = new Set<Address>();
        for (const m of poolMarkets) seen.add(m.marketToken.toLowerCase() as Address);
        return Array.from(seen);
    }, [poolMarkets]);

    const filteredMarkets = useMemo(() => {
        let list: PredictionMarket[];

        if (statusFilter === "all") {
            list = [...poolMarkets, ...closedMarkets];
        } else if (statusFilter === "open") {
            list = openedMarkets;
        } else {
            list = closedMarkets;
        }

        if (tokenFilter) {
            list = list.filter((m) => m.marketToken.toLowerCase() === tokenFilter);
        }

        return list;
    }, [poolMarkets, openedMarkets, closedMarkets, tokenFilter, statusFilter]);

    return (
        <PageContainer>
            <div className="flex items-center justify-between mb-6">
                <PageTitle title={"Predictions"} showSettings={false} />
            </div>

            <div className="flex flex-wrap w-full items-center gap-2 mb-6">
                {tokenOptions.length > 1 && (
                    <div className="flex items-center rounded-xl bg-card-dark border border-card-border">
                        <FilterPill active={tokenFilter === null} onClick={() => setTokenFilter(null)}>
                            All tokens
                        </FilterPill>
                        {tokenOptions.map((address) => (
                            <TokenPill
                                key={address}
                                active={tokenFilter === address}
                                onClick={() => setTokenFilter(tokenFilter === address ? null : address)}
                                address={address}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center rounded-xl ml-auto bg-card-dark border border-card-border">
                    {(["all", "open", "closed"] as StatusFilter[]).map((s) => (
                        <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                            {s === "all" ? "All" : s === "open" ? "My opened" : "My closed"}
                        </FilterPill>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-300 w-full">
                    <p className="text-sm">Loading markets...</p>
                </div>
            ) : filteredMarkets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-300 w-full">
                    <p className="text-sm">No markets match the selected filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {filteredMarkets.map((market) => (
                        <PredictionMarketCard key={market.id} market={market} now={now} />
                    ))}
                </div>
            )}
        </PageContainer>
    );
}

function FilterPill({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
    return (
        <Button
            className={cn("h-10 rounded-xl px-5", active ? "" : "hover:bg-card text-text-300 hover:text-text")}
            onClick={onClick}
            variant={active ? "secondary" : "icon"}
            size="sm"
        >
            {children}
        </Button>
    );
}

function TokenPill({ active, onClick, address }: { active: boolean; onClick: () => void; address: Address }) {
    const token = useCurrency(address);
    return (
        <FilterPill active={active} onClick={onClick}>
            <div className="flex items-center gap-1">
                <CurrencyLogo currency={token} size={16} />
                <span>{token ? token.symbol : `${address.slice(0, 4)}…${address.slice(-3)}`}</span>
            </div>
        </FilterPill>
    );
}
