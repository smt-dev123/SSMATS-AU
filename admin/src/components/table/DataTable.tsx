import { Table } from '@radix-ui/themes'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { HiArrowDown, HiArrowsUpDown, HiArrowUp } from 'react-icons/hi2'
import { DataTablePagination } from './DataTablePagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount?: number
  manualPagination?: boolean
  onPaginationChange?: OnChangeFn<PaginationState>
  paginationState?: PaginationState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  manualPagination,
  onPaginationChange,
  paginationState,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data ?? [],
    columns,
    ...(manualPagination && { pageCount }),
    manualPagination: manualPagination ?? false,
    ...(onPaginationChange && { onPaginationChange }),
    ...(paginationState && {
      state: {
        pagination: paginationState,
      },
    }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  return (
    <>
      <Table.Root variant="surface">
        <Table.Header>
          {table.getHeaderGroups().map((hg) => (
            <Table.Row key={hg.id}>
              {hg.headers.map((header) => (
                <Table.ColumnHeaderCell key={header.id}>
                  <div
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {header.column.getCanSort() &&
                      ({
                        asc: <HiArrowUp />,
                        desc: <HiArrowDown />,
                      }[header.column.getIsSorted() as string] ?? (
                        <HiArrowsUpDown />
                      ))}
                  </div>
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          ))}
        </Table.Header>

        <Table.Body>
          {rows.length > 0 ? (
            rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id} className="hover:bg-gray-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))
          ) : (
            <Table.Row>
              <Table.Cell
                colSpan={columns.length}
                className="text-center py-10 text-gray-500"
              >
                គ្មានទិន្នន័យ (No results).
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>

      {rows.length > 0 && <DataTablePagination table={table} />}
    </>
  )
}

export default DataTable
