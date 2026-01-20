export const ProductsPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products, error } = useProducts()

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
      <ProductsHeader onCreate={handleCreate} />
      <ProductsFilters />

      {error ? (
        <div className="text-red-500">{error.message}</div>
      ) : (
        <ProductsTable
          products={products?.data ?? []}
          onCreate={handleCreate}
          onEdit={handleEdit}
        />
      )}

      <ProductFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        product={selectedProduct}
      />
    </>
  )
}
