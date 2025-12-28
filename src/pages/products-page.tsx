export const ProductsPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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
      <ProductsTable />

      <ProductFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        product={selectedProduct}
      />
    </>
  )
}
