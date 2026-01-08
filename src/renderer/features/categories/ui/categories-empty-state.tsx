type Props = {
  onCreate: () => void
}

export const CategoriesEmptyState = ({ onCreate }: Props) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconLucideFolderOpen />
        </EmptyMedia>
        <EmptyTitle>Aún no hay categorías</EmptyTitle>
        <EmptyDescription>
          Crea tu primera categoría para organizar tus productos.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>
          <IconLucidePlus />
          Nueva Categoría
        </Button>
      </EmptyContent>
    </Empty>
  )
}
