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

        sileo.success({
          title: 'Categoría actualizada correctamente.',
        })
      } else {
        await createCategory(data)

        sileo.success({
          title: 'Categoría creada correctamente.',
        })
      }

      onSuccess()
    } catch (error) {
      console.error(error)
      sileo.error({
        title: 'Error al guardar la categoría.',
        description: parseError(error),
      })
    }
  }

  return { form, onSubmit, isEditing: Boolean(category) }
}
