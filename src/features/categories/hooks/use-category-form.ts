export const useCategoryForm = (category: Category | null) => {
  return useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category ? categoryToForm(category) : EMPTY_CATEGORY_FORM,
  })
}
