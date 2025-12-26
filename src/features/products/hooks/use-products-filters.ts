export const useProductsFilters = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProductStatus | null>(null)
  const [categories, setCategories] = useState<string | null>(null)

  return {
    filters: { search, status, categories },
    setSearch,
    setStatus,
    setCategories,
  }
}
