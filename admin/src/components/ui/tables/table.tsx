import { Table } from '@radix-ui/themes'
import clsx from 'clsx'

export function RootTable({
  children,
  classname,
}: {
  children: React.ReactNode
  classname?: string
}) {
  return (
    <Table.Root
      className={clsx(
        'rounded-md bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 overflow-hidden',
        classname,
      )}
    >
      {children}
    </Table.Root>
  )
}

export function HeaderTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Table.Header
      style={{ verticalAlign: 'middle' }}
      className={clsx('', className)}
    >
      {children}
    </Table.Header>
  )
}

export function BodyTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <Table.Body className={clsx('', className)}>{children}</Table.Body>
}

export function RowTable({
  children,
  className,
  isHeader = false,
}: {
  children: React.ReactNode
  className?: string
  isHeader?: boolean
}) {
  return (
    <Table.Row
      className={clsx({
        'font-semibold text-sm uppercase bg-gray-200 dark:bg-gray-900':
          isHeader,
        className,
      })}
    >
      {children}
    </Table.Row>
  )
}

export function CellTable({
  children,
  isHeader = false,
  noRightBorder = false,
  rowSpan = 1,
  columSpan = 1,
  className,
}: {
  children: React.ReactNode
  isHeader?: boolean
  noRightBorder?: boolean
  rowSpan?: number
  columSpan?: number
  className?: string
}) {
  const baseClass =
    'text-center border-gray-400 dark:border-gray-600 ' +
    (noRightBorder ? '' : 'border-r')

  if (isHeader) {
    return (
      <Table.ColumnHeaderCell
        colSpan={columSpan}
        rowSpan={rowSpan}
        className={clsx(baseClass, className)}
      >
        {children}
      </Table.ColumnHeaderCell>
    )
  }

  return (
    <Table.Cell
      colSpan={columSpan}
      rowSpan={rowSpan}
      className={clsx(
        baseClass,
        'text-center border-r border-gray-400 dark:border-gray-600 last:border-r-0',
        className,
      )}
    >
      {children}
    </Table.Cell>
  )
}
