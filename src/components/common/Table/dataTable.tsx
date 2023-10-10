import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, SortingState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[]
}

const DataTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue> ) => {

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
      )

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters
        }
    })

    return <>
      {/* <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div> */}
    <Table>
        <TableHeader className="[&_tr]:border-b-0">
            {table.getHeaderGroups().map(headerGroup => <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {
                    headerGroup.headers.map(header => <TableHead key={header.id} className="rounded-xl text-white">
                        {
                            header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
                        }
                    </TableHead>)
                }
            </TableRow>)}
        </TableHeader>
        <TableBody className="hover:bg-transparent">
            {
                table.getRowModel().rows?.length ? table.getRowModel().rows.map(row => <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="bg-card-dark hover:bg-card-dark" >
                    {row.getVisibleCells().map(cell => <TableCell key={cell.id} className="rounded-l">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>)}
                </TableRow>) : <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
            }
        </TableBody>
    </Table>
    <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
            </>
}

export default DataTable