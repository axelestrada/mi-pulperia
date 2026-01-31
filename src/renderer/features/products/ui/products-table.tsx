type Props = {
  products: Product[]
  onCreate: () => void
  onEdit: (product: Product) => void
}

export const ProductsTable = ({ onEdit, products }: Props) => {
  return <ProductsTableContent products={products} onEdit={onEdit} />
}
