export const ProductsPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products = [] } = useProducts()

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

      <ProductsTable
        products={products}
        onCreate={handleCreate}
        onEdit={handleEdit}
      />

      <ProductFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        product={selectedProduct}
      />
    </>
  )
}
