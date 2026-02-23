type Props = {
  product: Product
  onEdit: (product: Product) => void
}

export const ProductsTableRow = ({ product, onEdit }: Props) => {
  const { data: imagePath } = useImagePath(product.image)

  const { mutateAsync: deleteProduct } = useDeleteProduct()

  return (
    <TableRow>
      <TableCell>
        <SafeImage
          src={imagePath}
          alt={product.name}
          className="w-12 aspect-4/3 object-cover rounded"
        />
      </TableCell>

      <TableCell className="whitespace-normal">
        <p className="font-medium">{product.name}</p>
      </TableCell>

      <TableCell className="whitespace-normal">
        {product.description ?? '—'}
      </TableCell>

      <TableCell>{product.sku ?? '—'}</TableCell>

      <TableCell>{product.barcode ?? '—'}</TableCell>

      <TableCell>
        <Badge variant="secondary">{product.category.name}</Badge>
      </TableCell>

      <TableCell>
        <MeasurementUnitBadge unit={product.baseUnit} />
      </TableCell>

      <TableCell className="text-right">
        L {(product.salePrice / 100).toFixed(2)}
      </TableCell>

      <TableCell className="text-right">
        <span
          className={product.stock <= product.minStock ? 'text-red-500' : ''}
        >
          {product.stock}
        </span>{' '}
        / {product.minStock}
      </TableCell>

      <TableCell>
        <StatusBadge active={product.isActive} />
      </TableCell>

      <TableCell className="text-right">
        <ProductsTableActions
          onDelete={deleteProduct}
          onEdit={onEdit}
          product={product}
        />
      </TableCell>
    </TableRow>
  )
}
