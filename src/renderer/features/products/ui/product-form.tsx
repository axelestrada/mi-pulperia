type Props = {
  onSubmit: (data: ProductFormData) => Promise<void>
}

export const ProductForm = ({ onSubmit }: Props) => {
  return <ProductFormFields />
}
