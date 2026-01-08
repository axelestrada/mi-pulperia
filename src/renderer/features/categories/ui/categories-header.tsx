type Props = {
  onCreate: () => void
}

export const CategoriesHeader = ({ onCreate }: Props) => {
  return (
    <PageHeader
      title="Categorías"
      description="Organice sus categorías aquí."
      actions={
        <Button onClick={onCreate}>
          <IconLucidePlus /> Nueva Categoría
        </Button>
      }
    />
  )
}
