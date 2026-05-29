import { Button } from "@/components/ui/button";
import { CurrencyAmount, Pool, Position, Price, Token } from "@cryptoalgebra/integral-sdk";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useWriteLimitOrderManagerWithdraw } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { useChainId } from "wagmi";
import { LIMIT_ORDER_MANAGER } from "config";
import { KillLimitOrderModal } from "..";
import Loader from "@/components/common/Loader";
import { HeaderItem } from "@/components/common/Table/common";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useAppKitNetwork } from "@reown/appkit/react";

interface Epoch {
    id: string;
    filled: boolean;
    totalLiquidity: string;
}

interface Rate {
    token: Token;
    rate: Price<Token, Token>;
}

interface Rates {
    buy: Rate;
    sell: Rate;
}

interface Ticks {
    tickLower: number;
    tickUpper: number;
    tickCurrent: number;
    isClosed: boolean;
    killed: boolean;
    isFilled: boolean;
    zeroToOne: boolean;
}

interface Amount {
    token: Token;
    amount: CurrencyAmount<Token>;
    maxAmount?: CurrencyAmount<Token>;
}

interface Amounts {
    buy: Amount;
    sell: Amount;
}

export interface LimitOrderInfo {
    liquidity: string;
    initialLiquidity: string;
    killed: boolean;
    owner: Address;
    epoch: Epoch;
    positionLO: Position;
    zeroToOne: boolean;
    isClosed: boolean;
    ticks: Ticks;
    rates: Rates;
    amounts: Amounts;
    pool: Pool;
    time: Date;
}

const TokenAmount = ({ amount }: { amount: Amount }) => (
    <div className="flex items-center gap-4">
        <CurrencyLogo currency={amount.token} size={35} />
        <div className="text-left">
            <div className="font-bold">{amount.token.symbol}</div>
            <div>
                {amount.amount.toSignificant(3)} {amount.maxAmount ? `/ ${amount?.maxAmount?.toSignificant(3)}` : ""}
            </div>
        </div>
    </div>
);

const TokenRates = ({ rates }: { rates: Rates }) => (
    <div className="flex flex-col text-left">
        <div>{`1 ${rates.buy.token.symbol} = ${rates.buy.rate.toSignificant()} ${rates.sell.token.symbol}`}</div>
        <div>{`1 ${rates.sell.token.symbol} = ${rates.sell.rate.toSignificant()} ${rates.buy.token.symbol}`}</div>
    </div>
);

const StatusBar = ({ progress, sellToken, buyToken }: { progress: number; sellToken: Token; buyToken: Token }) => (
    <div className="relative w-full flex h-[25px] bg-card-dark rounded-xl">
        <div className="relative flex w-full h-full font-semibold text-sm">
            <div
                className={`flex items-center justify-end pl-1 pr-2 h-full bg-primary-100 border border-card-border duration-300 ${
                    Number(progress) === 100 ? "rounded-2xl" : "rounded-l-2xl"
                }`}
                style={{ width: `${progress}%` }}
            >
                <CurrencyLogo currency={sellToken} size={22} className="absolute left-1" />
            </div>
            <div
                className={`flex items-center pr-1 pl-2 h-full bg-accent-100 border border-card-border  duration-300 ${
                    Number(progress) === 100 ? "rounded-2xl" : "rounded-r-2xl"
                }`}
                style={{ width: `${100 - progress}%` }}
            >
                <CurrencyLogo currency={buyToken} size={22} className="absolute right-1" />
            </div>
            <span className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2">{`${Number(
                progress,
            ).toFixed()}%`}</span>
        </div>
    </div>
);

const LimitOrderStatus = ({ ticks, amounts }: { ticks: Ticks; amounts: Amounts }) => {
    if (ticks.killed)
        return (
            <div className="flex items-center gap-4 text-left">
                <XCircleIcon className="text-red-500" />
                <span>Cancelled</span>
            </div>
        );

    if (ticks.isClosed || ticks.isFilled)
        return (
            <div className="flex items-center gap-4 text-left">
                <CheckCircle2Icon className={"text-green-500"} />
                <span>Completed</span>
            </div>
        );

    const progress = (100 * (ticks.tickCurrent - ticks.tickLower)) / (ticks.tickUpper - ticks.tickLower);

    if (ticks.zeroToOne ? progress < 0 : progress > 0)
        return <StatusBar progress={0} sellToken={amounts.sell.token} buyToken={amounts.buy.token} />;

    if (ticks.zeroToOne ? progress >= 100 : progress <= -100)
        return (
            <div className="flex items-center gap-4 text-left">
                <CheckCircle2Icon className={"text-green-500"} />
                <span>Completed</span>
            </div>
        );

    return <StatusBar progress={progress} sellToken={amounts.sell.token} buyToken={amounts.buy.token} />;
};

const Action = (props: LimitOrderInfo) => {
    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    if (!userChainId || appChainId !== userChainId) return;

    if (props.killed) return;

    if (props.epoch.filled && props.liquidity === "0") return;

    if (props.epoch.filled) return <WithdrawLimitOrderButton {...props} />;

    return <KillLimitOrderModal {...props} />;
};

const WithdrawLimitOrderButton = ({ epoch, owner }: LimitOrderInfo) => {
    const chainId = useChainId();

    const withdrawConfig = {
        address: LIMIT_ORDER_MANAGER[chainId],
        args: [BigInt(epoch.id), owner] as const,
    };

    const { writeContract: withdraw, data: withdrawData } = useWriteLimitOrderManagerWithdraw({});

    const { isLoading: isWithdrawLoading } = useTransactionAwait(withdrawData, {
        type: TransactionType.LIMIT_ORDER,
        title: "Collect Limit Order",
    });

    return (
        <Button size={"sm"} onClick={() => withdraw && withdraw(withdrawConfig)}>
            {isWithdrawLoading ? <Loader /> : "Withdraw"}
        </Button>
    );
};

export const limitOrderColumns: ColumnDef<LimitOrderInfo>[] = [
    {
        accessorKey: "time",
        header: () => <HeaderItem className="ml-0">Time</HeaderItem>,
        cell: ({ getValue }) => <div className="ml-1  whitespace-nowrap">{(getValue() as Date).toLocaleString()}</div>,
        sortingFn: (rowA, rowB) => rowA.original.time.getTime() - rowB.original.time.getTime(),
        size: 200,
    },
    {
        accessorKey: "amounts.sell",
        header: () => <HeaderItem>You sell</HeaderItem>,
        cell: ({ getValue }) => <TokenAmount amount={getValue() as Amount} />,
        size: 180,
    },
    {
        accessorKey: "amounts.buy",
        header: () => <HeaderItem>You buy</HeaderItem>,
        cell: ({ getValue }) => <TokenAmount amount={getValue() as Amount} />,
        size: 180,
    },
    {
        accessorKey: "rates",
        header: () => <HeaderItem>Rates</HeaderItem>,
        cell: ({ getValue }) => <TokenRates rates={getValue() as Rates} />,
        size: 240,
    },
    {
        accessorKey: "ticks",
        header: () => <HeaderItem>Status</HeaderItem>,
        cell: ({ getValue, row }) => <LimitOrderStatus ticks={getValue() as Ticks} amounts={row.original.amounts} />,
        size: 200,
    },
    {
        id: "action",
        cell: (props) => (
            <div className="text-right">
                <Action {...props.row.original} />
            </div>
        ),
        size: 120,
    },
];
