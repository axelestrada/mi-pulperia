export const ProductsPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products = [], error, refetch } = useProducts()

  const handleCreate = () => {
    setSelectedProduct(null)
    setFormOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormOpen(true)
  }

  return (
    <>
      <div>{error?.message}</div>
      <ProductsHeader onCreate={handleCreate} />
      <ProductsFilters />

      <ProductsTable
        products={products}
        onCreate={handleCreate}
        onEdit={handleEdit}
        error={error}
        refetch={refetch}
      />

      <ProductFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        product={selectedProduct}
      />
    </>
  )
}
