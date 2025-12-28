type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  product: Product | null
}

export const ProductFormDialog = ({ product, open, setOpen }: Props) => {
  const isEdit = Boolean(product)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <ProductForm product={product} />
      </DialogContent>
    </Dialog>
  )
}
