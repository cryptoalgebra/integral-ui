import { Button } from "@/components/ui/button";
import { CurrencyAmount, Price, Token } from "@cryptoalgebra/integral-sdk";
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, CheckCircle2Icon } from "lucide-react";
import CurrencyLogo from "../CurrencyLogo";

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
}

interface Amount {
    token: Token;
    amount: CurrencyAmount<Token>;
}

interface Amounts {
    buy: Amount;
    sell: Amount;
}

interface LimitOrder {
    epoch: Epoch;
    zeroToOne: boolean;
    isClosed: boolean;
    ticks: Ticks;
    rates: Rates;
    amounts: Amounts;
}

const TokenAmount = ({ amount }: { amount: Amount } ) => {

    return <div className="flex items-center gap-4">
    <CurrencyLogo currency={amount.token} size={35}/>
    <div className="text-left">
        <div className="font-bold">{amount.token.symbol}</div>
        <div>{amount.amount.toSignificant()}</div>
    </div>
</div>

}

const TokenRates = ({ rates }: { rates: Rates }) => {

    return <div className="flex flex-col text-left">
        <div>{`1 ${rates.buy.token.symbol} = ${rates.buy.rate.toSignificant()} ${rates.sell.token.symbol}`}</div>
        <div>{`1 ${rates.sell.token.symbol} = ${rates.sell.rate.toSignificant()} ${rates.buy.token.symbol}`}</div>
    </div>
}

const LimitOrderStatus = ({ ticks }: { ticks: Ticks }) => {

    if (ticks.isClosed) return <div className="flex items-center gap-4 text-left">
        <CheckCircle2Icon color={'green'} />
        <span>Completed</span>
    </div>

    if (ticks.tickCurrent < ticks.tickLower) return 0

    const progress = 100 * (ticks.tickCurrent - ticks.tickLower) / (ticks.tickUpper - ticks.tickLower) 

    return <div>{progress}</div>

}

export const limitOrderColumns: ColumnDef<LimitOrder>[] = [
    {
        accessorKey: 'amounts.buy', 
        // header: () => <div className="py-1 py-2 hover:bg-red-500 -ml-4 h-full rounded-tl-3xl">You buy</div>,
        header: () => 'You buy',
        cell: ({ getValue }) => <TokenAmount amount={getValue() as Amount} />
    },
    {
        accessorKey: 'amounts.sell',
        header: 'You sell',
        cell: ({ getValue }) => <TokenAmount amount={getValue() as Amount} />
    },
    {
        accessorKey: 'rates',
        header: 'Rates',
        cell: ({ getValue }) => <TokenRates rates={getValue() as Rates } />
    },
    {
        accessorKey: 'ticks',
        header: 'Status',
        cell: ({ getValue }) => <LimitOrderStatus ticks={getValue() as Ticks} />,
    },
    {
        header: 'Actions',
        cell: (props) => {
            return 'Actions'
        }
    }
]