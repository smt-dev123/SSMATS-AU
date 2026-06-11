import { Button, Select } from '@radix-ui/themes'
import type { Table } from '@tanstack/react-table'

interface PaginationProps<T> {
  table: Table<T>
}

export function Pagination<T>({ table }: PaginationProps<T>) {
  // Function to determine the page numbers to display
  const getPageNumbers = () => {
    const totalPages = table.getPageCount()
    const currentPage = table.getState().pagination.pageIndex + 1
    const maxVisible = 5 // Maximum number of visible page buttons
    let pages: (number | string)[] = []

    if (totalPages <= maxVisible) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages]
      } else if (currentPage >= totalPages - 2) {
        pages = [
          1,
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ]
      } else {
        pages = [
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        ]
      }
    }
    return pages
  }

  const pageSizeOptions = [5, 10, 20, 50, 100]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Page Size Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>ចំនួនបង្ហាញ:</span>
        <Select.Root
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value: string) => table.setPageSize(Number(value))}
        >
          <Select.Trigger>
            {table.getState().pagination.pageSize}
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {pageSizeOptions.map((size) => (
                <Select.Item key={size} value={String(size)}>
                  {size}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </div>

      {/* Pagination Buttons */}
      <Button
        size="2"
        variant="outline"
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        ដំបូង
      </Button>
      <Button
        size="2"
        variant="outline"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        មុន
      </Button>

      {getPageNumbers().map((p, i) =>
        typeof p === 'number' ? (
          <Button
            size="2"
            key={i}
            variant={
              p === table.getState().pagination.pageIndex + 1
                ? 'solid'
                : 'outline'
            }
            onClick={() => table.setPageIndex(p - 1)}
          >
            {p}
          </Button>
        ) : (
          <span key={i}>...</span>
        ),
      )}

      <Button
        size="2"
        variant="outline"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        បន្ទាប់
      </Button>
      <Button
        size="2"
        variant="outline"
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        ចុងក្រោយ
      </Button>
    </div>
  )
}
