import { ColumnDef } from '@tanstack/react-table'
import { HeaderItem } from "./common";
import { formatUSD } from "@/utils/common/formatUSD";
import { formatPercent } from "@/utils/common/formatPercent";

interface MyPosition {
    id: number;
    outOfRange: boolean;
    range: string;
    liquidityUSD: number;
    feesUSD: number;
    apr: number;
}

export const myPositionsColumns: ColumnDef<MyPosition>[] = [
    {
        accessorKey: 'id',
        header: () => <HeaderItem className="ml-2">ID</HeaderItem>,
        cell: ({ getValue }) => <span className="ml-4">{`#${getValue()}`}</span>
    },
    {
        accessorKey: 'liquidityUSD',
        header: ({ column }) => <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>Liquidity</HeaderItem>,
        cell: ({ getValue }) => formatUSD.format(getValue() as number)
    },
    {
        accessorKey: 'feesUSD',
        header: ({ column }) => <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>Fees</HeaderItem>,
        cell: ({ getValue }) => formatUSD.format(getValue() as number)
    },
    {
        accessorKey: 'outOfRange',
        header: () => <HeaderItem>Status</HeaderItem>,
        cell: ({ getValue }) => getValue() ? <span className="text-yellow-400">Out of range</span> : <span className="text-green-400">In range</span> 
    },
    {
        accessorKey: 'range',
        header: () => <HeaderItem>Range</HeaderItem>
    },
    {
        accessorKey: 'apr',
        header: ({column}) => <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>APR</HeaderItem>,
        cell: ({ getValue }) => formatPercent.format((getValue() as number) / 10_000)
    }
]