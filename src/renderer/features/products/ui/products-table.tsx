import { ProductDTO } from "~/src/main/domains/products/products-model"

type Props = {
  onEdit: (product: ProductDTO) => void
}

export const ProductsTable = ({ onEdit }: Props) => {
  return <ProductsTableContent onEdit={onEdit} />
}
