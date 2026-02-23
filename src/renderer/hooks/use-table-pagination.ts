export function useTablePagination<T>(items: T[], initialPageSize = 5) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const total = items.length

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  const setItemsPerPage = (n: number) => {
    setPage(1)
    setPageSize(n)
  }

  return { page, setPage, pageSize, setItemsPerPage, total, pagedItems }
}
