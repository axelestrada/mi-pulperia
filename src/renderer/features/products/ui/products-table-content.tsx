type Props = {
  products: Product[]
  onEdit: (product: Product) => void
}

export const ProductsTableContent = ({ products, onEdit }: Props) => {
  return (
    <Table>
      <ProductsTableHeader />

      <TableBody>
        {products.map(product => (
          <ProductsTableRow
            key={'product-' + product.id}
            product={product}
            onEdit={onEdit}
          />
        ))}
      </TableBody>
    </Table>
  )
}
