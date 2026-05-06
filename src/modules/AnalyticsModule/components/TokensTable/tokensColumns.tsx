import { ColumnDef } from "@tanstack/react-table";
import { formatAmount } from "@/utils/common/formatAmount";
import { Token } from "@cryptoalgebra/integral-sdk";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { HeaderItem } from "@/components/common/Table/common";

export interface TokenColumn {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    price: number;
    change: number;
    volume: number;
    tvl: number;
    tokenSDK: Token;
}

function TokenName({ tokenSDK }: TokenColumn) {
    return (
        <div className="ml-1.5 flex items-center gap-3">
            <CurrencyLogo currency={tokenSDK} size={32} className="ring-2 ring-card" />
            <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{tokenSDK?.symbol}</p>
                <p className="truncate text-xs text-text-muted">{tokenSDK?.name}</p>
            </div>
        </div>
    );
}

export const tokensColumns: ColumnDef<TokenColumn>[] = [
    {
        accessorKey: "id",
        header: () => <HeaderItem className="ml-2">Token</HeaderItem>,
        cell: ({ row }) => <TokenName {...row.original} />,
        filterFn: (v, _, value) =>
            [v.original.symbol, v.original.id]
                .join(" ")
                .toLowerCase()
                .includes(value.toLowerCase()),
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Price
            </HeaderItem>
        ),
        cell: ({ getValue }) => <span className="font-medium text-text">${formatAmount(getValue() as number, 4)}</span>,
    },
    // {
    //   accessorKey: 'change',
    //   header: ({ column }) => (
    //     <HeaderItem
    //       sort={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    //       isAsc={column.getIsSorted() === 'asc'}
    //     >
    //       24H Change
    //     </HeaderItem>
    //   ),
    //   cell: ({ getValue }) => (
    //     <div className="flex flex-col items-start gap-1">
    //       <p className="opacity-50 sm:hidden">24H Change</p>
    //       <span>${formatAmount(getValue() as number, 4)}</span>
    //     </div>
    //   ),
    // },
    {
        accessorKey: "volume",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Volume
            </HeaderItem>
        ),
        cell: ({ getValue }) => <span className="font-medium text-text">${formatAmount(getValue() as number, 2)}</span>,
    },
    {
        accessorKey: "tvl",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                TVL
            </HeaderItem>
        ),
        cell: ({ getValue }) => <span className="font-medium text-text">${formatAmount(getValue() as number, 2)}</span>,
    },
];
