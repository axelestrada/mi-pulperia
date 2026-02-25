import { Table, TableBody } from "@/components/ui/table"

type Props = {
  categories: Category[]
  onEdit: (category: Category) => void
}

export const CategoriesTableContent = ({ categories, onEdit }: Props) => {
  return (
    <Table>
      <CategoriesTableHeader />

      <TableBody>
        {categories.map(category => (
          <CategoriesTableRow
            key={'category-' + category.id}
            category={category}
            onEdit={onEdit}
          />
        ))}
      </TableBody>
    </Table>
  )
}
