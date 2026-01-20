type Props = {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: Product['id']) => void
}

export const ProductsTableActions = ({ product, onEdit, onDelete }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
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
          <DropdownMenuItem
            onClick={() => {
              setOpen(true)
            }}
          >
            <IconLucideEye className="size-4 mr-2" />
            Ver presentaciones
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DeleteProductDialog onDelete={() => onDelete(product.id)}>
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

      <ProductPresentationsDialog
        product={product}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
