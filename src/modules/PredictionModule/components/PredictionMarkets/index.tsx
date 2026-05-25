import { PredictionMarketCard } from "../";
import { useAccount } from "wagmi";
import { useNow } from "@/hooks/common/useNow";
import { useAllOpenMarkets, useUserMarkets } from "../../hooks";

export function PredictionMarkets() {
    const { address: account } = useAccount();

    const { data: poolMarkets } = useAllOpenMarkets();
    const {
        data: { closedMarkets, openedMarkets },
    } = useUserMarkets(account);

    const now = useNow();

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <div className="text-xl font-semibold">All Markets</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-b-lg">
                {poolMarkets.map((market) => (
                    <PredictionMarketCard key={market.id} market={market} now={now} />
                ))}
            </div>
            {Boolean(openedMarkets.length) && (
                <div className="text-left">
                    <div className="text-xl font-semibold mb-4">My Opened Markets</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-b-lg">
                        {openedMarkets.map((market) => (
                            <PredictionMarketCard key={market.id} market={market} now={now} />
                        ))}
                    </div>
                </div>
            )}
            {Boolean(closedMarkets.length) && (
                <div className="text-left">
                    <div className="text-xl font-semibold mb-4">My Closed Markets</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-b-lg">
                        {closedMarkets.map((market) => (
                            <PredictionMarketCard key={market.id} market={market} now={now} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
