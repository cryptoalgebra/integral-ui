import { Button } from "@/components/ui/button";
import { CurrencyAmount, Pool, Price, Token } from "@cryptoalgebra/integral-sdk";
import { ColumnDef } from '@tanstack/react-table'
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import CurrencyLogo from "../CurrencyLogo";
import { usePrepareAlgebraLimitOrderPluginWithdraw } from "@/generated";
import { Address, useContractWrite } from "wagmi";
import { useTransitionAwait } from "@/hooks/common/useTransactionAwait";
import Loader from "../Loader";
import { useWeb3ModalState } from "@web3modal/wagmi/react";
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import KillLimitOrderModal from "@/components/modals/KillLimitOrderModal";
import { HeaderItem } from "./common";

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
}

interface Amounts {
    buy: Amount;
    sell: Amount;
}

export interface LimitOrder {
    liquidity: string;
    initialLiquidity: string;
    killed: boolean;
    owner: Address;
    epoch: Epoch;
    zeroToOne: boolean;
    isClosed: boolean;
    ticks: Ticks;
    rates: Rates;
    amounts: Amounts;
    pool: Pool;
}

const TokenAmount = ({ amount }: { amount: Amount }) => <div className="flex items-center gap-4">
    <CurrencyLogo currency={amount.token} size={35} />
    <div className="text-left">
        <div className="font-bold">{amount.token.symbol}</div>
        <div>{amount.amount.toSignificant(3)}</div>
    </div>
</div>

const TokenRates = ({ rates }: { rates: Rates }) => <div className="flex flex-col text-left">
    <div>{`1 ${rates.buy.token.symbol} = ${rates.buy.rate.toSignificant()} ${rates.sell.token.symbol}`}</div>
    <div>{`1 ${rates.sell.token.symbol} = ${rates.sell.rate.toSignificant()} ${rates.buy.token.symbol}`}</div>
</div>


const LimitOrderStatus = ({ ticks }: { ticks: Ticks }) => {

    if (ticks.killed) return <div className="flex items-center gap-4 text-left">
        <XCircleIcon className="text-red-500" />
        <span>Cancelled</span>
    </div>

    if (ticks.isClosed) return <div className="flex items-center gap-4 text-left">
        <CheckCircle2Icon className={'text-green-500'} />
        <span>Completed</span>
    </div>

    const progress = (100 * (ticks.tickCurrent - ticks.tickLower) / (ticks.tickUpper - ticks.tickLower))

    if (ticks.zeroToOne ? (progress < 0) : (progress > 0) ) return <div className="text-left">0%</div>

    if (ticks.zeroToOne ? (progress >= 100) : (progress <= -100) ) return <div className="flex items-center gap-4 text-left">
        <CheckCircle2Icon className={'text-green-500'} />
        <span>Completed</span>
    </div>

    return <div className="text-left">{`${progress.toFixed(1)}%`}</div>

}

const Action = (props: LimitOrder) => {

    const { selectedNetworkId } = useWeb3ModalState()

    if (selectedNetworkId !== DEFAULT_CHAIN_ID) return

    if (props.killed) return

    if (props.epoch.filled && props.liquidity === "0") return

    if (props.epoch.filled) return <WithdrawLimitOrderButton {...props} />

    return <KillLimitOrderModal {...props} />

}

const WithdrawLimitOrderButton = ({ epoch, owner }: LimitOrder) => {

    const { config: withdrawConfig } = usePrepareAlgebraLimitOrderPluginWithdraw({
        args: [
            BigInt(epoch.id),
            owner
        ]
    })

    const { data: withdrawData, write: withdraw } = useContractWrite(withdrawConfig)

    const { isLoading: isWithdrawLoading } = useTransitionAwait(withdrawData?.hash, 'Collect Limit Order')

    return <Button size={'sm'} onClick={() => withdraw && withdraw()}>
        {isWithdrawLoading ? <Loader /> : 'Withdraw'}
    </Button>

}

export const limitOrderColumns: ColumnDef<LimitOrder>[] = [
    {
        accessorKey: 'amounts.buy',
        header: () => <HeaderItem className="ml-2">You buy</HeaderItem>,
        cell: ({ getValue }) => <div className="ml-4"><TokenAmount amount={getValue() as Amount} /></div>,
    },
    {
        accessorKey: 'amounts.sell',
        header: () => <HeaderItem>You sell</HeaderItem>,
        cell: ({ getValue }) => <TokenAmount amount={getValue() as Amount} />
    },
    {
        accessorKey: 'rates',
        header: () => <HeaderItem>Rates</HeaderItem>,
        cell: ({ getValue }) => <TokenRates rates={getValue() as Rates} />
    },
    {
        accessorKey: 'ticks',
        header: () => <HeaderItem>Status</HeaderItem>,
        cell: ({ getValue }) => <LimitOrderStatus ticks={getValue() as Ticks} />
    },
    {
        id: 'action',
        cell: (props) => <div className="text-right"><Action {...props.row.original} /></div>
    }
]