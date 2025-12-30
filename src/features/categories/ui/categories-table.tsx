type Props = {
  categories: Category[]
  onEdit: (category: Category) => void
}

export const CategoriesTable = ({ onEdit, categories }: Props) => {

  return (
    <div className="border rounded-xl">
      <CategoriesTableContent categories={categories} onEdit={onEdit} />
    </div>
  )
}
