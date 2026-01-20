import { CreatePresentationButton } from '@/features/presentations/ui/create-presentation-button'

type Props = {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductPresentationsDialog({
  product,
  open,
  onOpenChange,
}: Props) {
  const { data, isLoading } = usePresentationsByProduct(product.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-11/12 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Presentaciones – {product.name}</DialogTitle>
          <DialogDescription>
            Administra las presentaciones de este producto
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <CreatePresentationButton product={product} />
        </div>

        <PresentationsTable
          presentations={data ?? []}
          isLoading={isLoading}
          product={product}
        />
      </DialogContent>
    </Dialog>
  )
}
