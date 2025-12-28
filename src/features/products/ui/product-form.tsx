type Props = {
  product: Product | null
}

export const ProductForm = ({ product }: Props) => {
  const form = useProductForm(product)

  const onSubmit = (data: ProductFormData) => {
    console.table(data)
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ProductFormField />
      </form>
    </FormProvider>
  )
}
