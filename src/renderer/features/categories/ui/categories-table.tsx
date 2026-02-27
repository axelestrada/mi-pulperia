type Props = {
  onCreate: () => void
  onEdit: (category: Category) => void
}

export const CategoriesTable = ({ onCreate, onEdit }: Props) => {
  const { data: categoriesResult } = useCategories({
    page: 1,
    pageSize: 1000,
  })
  const categories = categoriesResult?.data ?? []

  if (categories.length === 0) {
    return <CategoriesEmptyState onCreate={onCreate} />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <CategoriesTableContent categories={categories} onEdit={onEdit} />
    </div>
  )
}
