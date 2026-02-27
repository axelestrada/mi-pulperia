type Props = {
  onCreate: () => void
  onFiltersChange: (filters: {
    search: string
    categories: number[]
    status: string[]
  }) => void
}

export const ProductsFilters = ({ onCreate, onFiltersChange }: Props) => {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>([])

  const { data: categoriesResult } = useCategories({
    page: 1,
    pageSize: 1000,
  })
  const categoriesData = categoriesResult?.data ?? []

  useEffect(() => {
    onFiltersChange({ search, categories: categories.map(Number), status })
  }, [search, categories, status, onFiltersChange]) // TODO: en el padre envolver en useCallback

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <InputGroup>
          <InputGroupInput
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <InputGroupAddon>
            <IconLucideSearch />
          </InputGroupAddon>
        </InputGroup>

        <TableFacetedFilter
          title="Categoría"
          value={categories}
          onChange={setCategories}
          options={categoriesData.map(cat => ({
            value: String(cat.id),
            label: cat.name,
          }))}
        />

        <TableFacetedFilter
          title="Estado"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'active', label: 'Activo' },
            { value: 'inactive', label: 'Inactivo' },
          ]}
        />
      </div>

      <Button onClick={onCreate}>Agregar Producto</Button>
    </div>
  )
}
