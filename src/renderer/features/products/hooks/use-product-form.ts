import type { ProductDTO } from '~/src/main/domains/products/products-model'

export const useProductForm = (
  product: ProductDTO | null,
  onSuccess: () => void
) => {
  const form = useForm<ProductFormInput, unknown, ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? productToForm(product) : EMPTY_PRODUCT_FORM,
  })

  const { mutateAsync: createProduct } = useCreateProduct()
  const { mutateAsync: updateProduct } = useUpdateProduct()

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        await updateProduct({
          id: product.id,
          data,
        })
        toast.success('Producto actualizado correctamente.')
      } else {
        await createProduct(data)
        toast.success('Producto creado correctamente.')
      }
      onSuccess()
    } catch (error) {
      console.error(error)

      toast.error('Error al guardar el producto.', {
        description: parseError(error),
      })
    }
  }

  return { form, onSubmit, isEditing: Boolean(product) }
}
