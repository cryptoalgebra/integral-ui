import { ColumnDef } from "@tanstack/react-table";
import { formatAmount } from "@/utils/common/formatAmount";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
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
    tokenSDK: Currency;
}

function TokenName({ tokenSDK }: TokenColumn) {
    return (
        <div className="flex items-center gap-4 ml-2">
            <CurrencyLogo currency={tokenSDK} size={30} />
            <span>{tokenSDK?.symbol}</span>
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
        cell: ({ getValue }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">Price</p>
                <span>${formatAmount(getValue() as number, 4)}</span>
            </div>
        ),
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
        cell: ({ getValue }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">Volume</p>
                <span>${formatAmount(getValue() as number, 4)}</span>
            </div>
        ),
    },
    {
        accessorKey: "tvl",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                TVL
            </HeaderItem>
        ),
        cell: ({ getValue }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">TVL</p>
                <span>${formatAmount(getValue() as number, 4)}</span>
            </div>
        ),
    },
];
