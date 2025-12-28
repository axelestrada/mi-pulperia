  export const useProductForm = (product: Product | null) => {
  return useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? productToForm(product) : EMPTY_PRODUCT_FORM,
  })
}
