import { ProductsListFilters } from 'domains/products/products-list-filters'

export const ProductsPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products } = useProducts()

  const handleCreate = () => {
    setSelectedProduct(null)
    setFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormOpen(true)
  }

  const handleFiltersChange = useCallback((filters: ProductsListFilters) => {
    console.log(filters)
  }, [])

  return (
    <>
      <ProductsHeader />
      <ProductsFilters
        onCreate={handleCreate}
        onFiltersChange={handleFiltersChange}
      />

      <ProductsTable
        products={products?.data ?? []}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <TablePagination />

      <ProductFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        product={selectedProduct}
      />
    </>
  )
}
