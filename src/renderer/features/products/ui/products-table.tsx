type Props = {
  onCreate: () => void
  onEdit: (product: Product) => void
}

export const ProductsTable = ({ onCreate, onEdit }: Props) => {
  const { data: products = [] } = useProducts()

  if (products.length === 0) {
    return <ProductsEmptyState onCreate={onCreate} />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <ProductsTableContent products={products} onEdit={onEdit} />
    </div>
  )
}
