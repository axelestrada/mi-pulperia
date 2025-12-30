type Props = {
  categories: Category[]
  onEdit: (category: Category) => void
}

export const CategoriesTableContent = ({ categories, onEdit }: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {categories.map(category => (
          <CategoryTableRow
            key={'category-' + category.id}
            category={category}
            onEdit={onEdit}
          />
        ))}
      </TableBody>
    </Table>
  )
}
