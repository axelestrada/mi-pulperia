import { PresentationFormDialog } from './presentation-form-dialog'

type Props = {
  product: Product
}

export function CreatePresentationButton({ product }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconLucidePlus className="mr-2 size-4" />
        Nueva presentación
      </Button>

      <PresentationFormDialog
        mode="create"
        product={product}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
