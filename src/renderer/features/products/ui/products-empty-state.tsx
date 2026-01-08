type Props = {
  onCreate: () => void
}

export const ProductsEmptyState = ({ onCreate }: Props) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconLucideFolderOpen />
        </EmptyMedia>
        <EmptyTitle>Aún no hay productos</EmptyTitle>
        <EmptyDescription>
          Crea tu primera producto para comenzar a vender.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>
          <IconLucidePlus />
          Nuevo Producto
        </Button>
      </EmptyContent>
    </Empty>
  )
}
