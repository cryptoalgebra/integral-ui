import { TradeStateType } from "@/types/trade-state";
import { TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { Address } from "viem";

export interface SmartRouterBestTrade {
    refresh: () => Promise<void>;
    trade:
        | {
              bestTrade: SmartRouterTrade<TradeType>;
              blockNumber: bigint | undefined;
              calldata: Address | undefined;
              value: Address | undefined;
          }
        | {
              bestTrade: undefined;
              blockNumber: undefined;
              calldata: undefined;
              value: undefined;
          }
        | undefined;
    state: TradeStateType;
}
