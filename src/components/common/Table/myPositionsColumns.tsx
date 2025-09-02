import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { formatAmount } from "@/utils/common/formatAmount";

interface MyPosition {
    id: string;
    outOfRange: boolean;
    range: string;
    liquidityUSD: number;
    feesUSD: number | null;
    apr: number;
}

export const myPositionsColumns: ColumnDef<MyPosition>[] = [
    {
        accessorKey: "id",
        header: () => <HeaderItem className="min-w-[110px] ml-2">ID</HeaderItem>,
        cell: ({ getValue }) => <span className="ml-4">{`#${getValue()}`}</span>,
    },
    {
        accessorKey: "liquidityUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Liquidity
            </HeaderItem>
        ),
        cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
    },
    {
        accessorKey: "feesUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees
            </HeaderItem>
        ),
        cell: ({ getValue }) => {
            return typeof getValue() === "number" ? `$${formatAmount(getValue() as number, 2)}` : " ";
        },
    },
    {
        accessorKey: "outOfRange",
        header: ({ column }) => (
            <HeaderItem
                className="min-w-[100px]"
                sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
                isAsc={column.getIsSorted() === "asc"}
            >
                Status
            </HeaderItem>
        ),
        cell: ({ getValue }) =>
            getValue() ? <span className="text-yellow-400">Out of range</span> : <span className="text-green-400">In range</span>,
    },
    {
        accessorKey: "range",
        header: () => <HeaderItem className="min-w-[180px]">Range</HeaderItem>,
        cell: ({ getValue }) => getValue() as string,
    },
    {
        accessorKey: "apr",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                APR
            </HeaderItem>
        ),
        cell: ({ getValue }) => `${formatAmount(getValue() as number, 2)}%`,
    },
];
