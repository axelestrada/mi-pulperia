import type { PaginationProps } from '@heroui/react'

export const TablePagination = (props: PaginationProps) => {
  return (
    <div className="p-2 flex justify-end items-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        {...props}
      />
    </div>
  )
}
