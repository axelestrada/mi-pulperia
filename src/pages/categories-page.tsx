export const CategoriesPage = () => {
  const { data: categories = [] } = useCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  )

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  return (
    <>
      <CategoriesHeader onCreate={handleCreate} />
      <CategoriesFilters />

      {categories.length > 0 ? (
        <CategoriesTableContent categories={categories} onEdit={handleEdit} />
      ) : (
        <CategoriesEmptyState onCreate={handleCreate} />
      )}

      <CategoryFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        category={selectedCategory}
      />
    </>
  )
}
