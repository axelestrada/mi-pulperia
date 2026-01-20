type Props = {
  presentation: Presentation
  product: Product
}

export function PresentationsTableActions({
  presentation,
  product,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const toggleMutation = useTogglePresentation(product.id)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon-sm">
            <IconLucideMoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <IconLucideEdit className="mr-2 size-4" />
            Editar
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              toggleMutation.mutate({
                id: presentation.id,
                isActive: !presentation.isActive,
              })
            }
          >
            {presentation.isActive ? (
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
        </DropdownMenuContent>
      </DropdownMenu>

      <PresentationFormDialog
       mode={presentation ? 'edit' : 'create'}
        product={product}
        presentation={presentation}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  )
}