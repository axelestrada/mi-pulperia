type Props = {
  mode: PresentationFormMode
  product: Product
  presentation?: Presentation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PresentationFormDialog({
  product,
  presentation,
  open,
  onOpenChange,
  mode,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-11/12 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {presentation ? 'Editar presentación' : 'Nueva presentación'}
          </DialogTitle>
        </DialogHeader>

        <PresentationForm
          product={product}
          presentation={presentation}
          mode={mode}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
