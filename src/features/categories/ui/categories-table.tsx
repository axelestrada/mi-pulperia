type Props = {
  onEdit: (category: Category) => void
}

export const CategoriesTable = ({ onEdit }: Props) => {
  const { data: categories } = useCategories()

  return (
    <div className="border rounded-xl">
      <CategoriesTableContent categories={categories ?? []} onEdit={onEdit} />
    </div>
  )
}
