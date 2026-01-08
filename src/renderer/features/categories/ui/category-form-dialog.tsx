type Props = {
  open: boolean
  setOpen: (open: boolean) => void
  category: Category | null
}

export const CategoryFormDialog = ({ category, open, setOpen }: Props) => {
  const isEdit = Boolean(category)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifique los detalles de la categoría.'
              : 'Complete el formulario para crear una nueva categoría.'}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm category={category} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
