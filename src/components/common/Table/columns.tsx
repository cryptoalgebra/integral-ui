import { Button } from "@/components/ui/button";
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from "lucide-react";

interface MyPosition {
    id: number;
    range: string;
    status: 'inRange' | 'outOfRange';
    liquidity: number;
    apr: number;
}

export const columns: ColumnDef<MyPosition>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <Button variant="ghost" onClick={() => column.getIsSorted() === "asc"}>
            ID
            <ArrowUpDown />
        </Button>
    },
    {
        accessorKey: 'range', 
        header: 'Range'
    },
    {
        accessorKey: 'liquidity',
        header: 'Liquidity'
    },
    {
        accessorKey: 'status',
        header: 'Status'
    },
    {
        accessorKey: 'apr',
        header: 'APPR'
    }
]