import { Button, Flex, Select } from '@radix-ui/themes'

interface Props {
  pageIndex: number
  pageSize: number
  pageCount: number
  onPaginationChange: (updater: any) => void
}

export function ManualPagination({
  pageIndex,
  pageSize,
  pageCount,
  onPaginationChange,
}: Props) {
  const getPageNumbers = () => {
    const totalPages = pageCount
    const currentPage = pageIndex + 1
    const maxVisible = 5
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

  const setPageIndex = (index: number) => {
    onPaginationChange((prev: any) => ({
      ...prev,
      pageIndex: index,
    }))
  }

  const setPageSize = (size: number) => {
    onPaginationChange((prev: any) => ({
      ...prev,
      pageSize: size,
      pageIndex: 0,
    }))
  }

  return (
    <Flex justify="between" mt="4" align="center" gap="4" wrap="wrap">
      {/* Page Size Selector */}
      <Flex gap="2" align="center">
        <span className="text-sm text-gray-500">ចំនួនបង្ហាញ:</span>
        <Select.Root
          value={String(pageSize)}
          onValueChange={(value: string) => setPageSize(Number(value))}
        >
          <Select.Trigger>{pageSize}</Select.Trigger>
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
      </Flex>

      {/* Pagination Buttons */}
      <Flex gap="2" align="center">
        <Button
          size="2"
          variant="outline"
          onClick={() => setPageIndex(0)}
          disabled={pageIndex === 0}
          className="cursor-pointer"
        >
          ដំបូង
        </Button>
        <Button
          size="2"
          variant="outline"
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="cursor-pointer"
        >
          មុន
        </Button>

        {getPageNumbers().map((p, i) =>
          typeof p === 'number' ? (
            <Button
              size="2"
              key={i}
              variant={p === pageIndex + 1 ? 'solid' : 'outline'}
              onClick={() => setPageIndex(p - 1)}
              className="cursor-pointer"
            >
              {p}
            </Button>
          ) : (
            <span key={i} className="px-2">
              ...
            </span>
          ),
        )}

        <Button
          size="2"
          variant="outline"
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          className="cursor-pointer"
        >
          បន្ទាប់
        </Button>
        <Button
          size="2"
          variant="outline"
          onClick={() => setPageIndex(pageCount - 1)}
          disabled={pageIndex >= pageCount - 1}
          className="cursor-pointer"
        >
          ចុងក្រោយ
        </Button>
      </Flex>
    </Flex>
  )
}
