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
          className="h-12 w-12 object-cover rounded"
        />
      </TableCell>

      <TableCell className="whitespace-normal">
        <p className="font-medium">{product.name}</p>
      </TableCell>

      <TableCell className="whitespace-normal">
        {product.description ?? 'N/A'}
      </TableCell>

      <TableCell>{product.sku ?? 'N/A'}</TableCell>

      <TableCell>{product.barcode ?? 'N/A'}</TableCell>

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
        <Badge
          variant={product.isActive ? 'default' : 'destructive'}
          className={product.isActive ? 'bg-green-600' : ''}
        >
          {product.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon-sm">
              <IconLucideMoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onEdit(product)
              }}
            >
              <IconLucideEdit className="size-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem>
              {product.isActive ? (
                <>
                  <IconLucideX className="mr-2 size-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <IconLucideCheck className="mr-2 size-4" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteProductDialog onDelete={() => deleteProduct(product.id)}>
              <DropdownMenuItem
                variant="destructive"
                onSelect={e => {
                  e.preventDefault()
                }}
              >
                <IconLucideTrash2 className="size-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DeleteProductDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
