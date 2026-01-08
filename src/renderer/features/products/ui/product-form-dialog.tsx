type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  product: Product | null
}

export const ProductFormDialog = ({ product, open, setOpen }: Props) => {
  const isEdit = Boolean(product)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-11/12 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique los detalles del producto.'
              : 'Complete el formulario para crear un nuevo producto.'}
          </DialogDescription>
        </DialogHeader>

        <ProductForm product={product} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
