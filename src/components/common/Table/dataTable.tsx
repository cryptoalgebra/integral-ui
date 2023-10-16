import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, SortingState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectedRow?: number;
  action?: (args?: any) => void;
  defaultSortingID?: string;
  link?: string;
  showPagination?: boolean;
  searchID?: string;
  loading?: boolean;
}

const DataTable = <TData, TValue>({ columns, data, selectedRow, action, link, defaultSortingID, showPagination = true, loading }: DataTableProps<TData, TValue>) => {

  const [sorting, setSorting] = useState<SortingState>(defaultSortingID ? [{id: defaultSortingID, desc: true}] : [])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const navigate = useNavigate()

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

  if (loading) return <LoadingState />

  return <>
    {/* {searchID && <div className="flex items-center p-4">
        <Input
          placeholder="Search"
          value={(table.getColumn(searchID)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchID)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>} */}
    <Table>
      <TableHeader className="[&_tr]:border-b-0">
        {table.getHeaderGroups().map(headerGroup => <TableRow key={headerGroup.id} className="hover:bg-transparent">
          {
            headerGroup.headers.map(header => <TableHead key={header.id} className="rounded-xl text-white font-semibold">
              {
                header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())
              }
            </TableHead>)
          }
        </TableRow>)}
      </TableHeader>
      <TableBody className="hover:bg-transparent text-[16px]">
        {table.getRowModel().rows?.length ? table.getRowModel().rows.map((row: any) => {

          const isSelected = Number(selectedRow) === Number(row.original.id)

          return <TableRow
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            className={`border-card-border/40 ${isSelected ? 'bg-muted-primary/60' : 'bg-card-dark'} ${(action || link) && 'cursor-pointer'} ${(action || link) ? isSelected ? 'hover:bg-muted-primary' : 'hover:bg-card-hover' : 'hover:bg-card-dark'}`}
            onClick={() => {
              
              if (action) {
                action(row.original.id)
              } else if (link) {
                navigate(`/${link}/${row.original.id}`)
              }

            }} 
          >
            {row.getVisibleCells().map((cell: any) => <TableCell key={cell.id} className="rounded-l text-left">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
            )}
          </TableRow>
        }) : <TableRow className="hover:bg-card h-full">
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
        }
      </TableBody>
    </Table>
    {
      showPagination && 
      <div className="flex items-center justify-end space-x-2 pt-4 pb-2 px-4 mt-auto">
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
    </div>}
  </>
}

const LoadingState = () => <div className="flex flex-col w-full gap-4 p-4">
  {[1,2,3,4].map(v => <Skeleton key={`table-skeleton-${v}`} className="w-full h-[50px] bg-card-light rounded-xl" />)}
</div>

export default DataTable