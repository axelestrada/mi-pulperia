export const CategoriesPage = () => {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

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

      <CategoriesTable onEdit={handleEdit} />

      <CategoryFormDialog
        open={formOpen}
        setOpen={setFormOpen}
        category={selectedCategory}
      />
    </>
  )
}
