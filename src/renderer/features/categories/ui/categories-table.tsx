type Props = {
  onCreate: () => void
  onEdit: (category: Category) => void
}

export const CategoriesTable = ({ onCreate, onEdit }: Props) => {
  const { data: categories = [] } = useCategories()

  if (categories.length === 0) {
    return <CategoriesEmptyState onCreate={onCreate} />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <CategoriesTableContent categories={categories} onEdit={onEdit} />
    </div>
  )
}
