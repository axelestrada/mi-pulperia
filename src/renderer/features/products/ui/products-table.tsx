type Props = {
  products: Product[]
  onCreate: () => void
  onEdit: (product: Product) => void
}

export const ProductsTable = ({ onCreate, onEdit, products }: Props) => {
  if (products.length === 0) {
    return <ProductsEmptyState onCreate={onCreate} />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <ProductsTableContent products={products} onEdit={onEdit} />
    </div>
  )
}
