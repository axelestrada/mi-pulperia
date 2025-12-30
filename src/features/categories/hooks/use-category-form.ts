export const useCategoryForm = (
  category: Category | null,
  onSuccess: () => void
) => {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category ? categoryToForm(category) : EMPTY_CATEGORY_FORM,
  })

  const { mutateAsync: createCategory } = useCreateCategory()
  const { mutateAsync: updateCategory } = useUpdateCategory()

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await updateCategory({
          id: category.id,
          data,
        })

        toast.success('Categoría actualizada correctamente.')
      } else {
        await createCategory(data)

        toast.success('Categoría creada correctamente.')
      }

      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar la categoría.')
    }
  }

  return { form, onSubmit, isEditing: Boolean(category) }
}
