import { toUnitPrecision } from '../../../../shared/utils/quantity'

export const useInventoryEntryForm = () => {
  const { mutateAsync: addStock } = useAddStock()
  const { data: products } = useProducts({ page: 1, pageSize: 1000 })

  const form = useForm<
    InventoryEntryFormInput,
    unknown,
    InventoryEntryFormData
  >({
    resolver: zodResolver(inventoryEntrySchema),
    defaultValues: INVENTORY_ENTRY_DEFAULTS,
  })

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const onSubmit = async (data: InventoryEntryFormData) => {
    try {
      const productPrecisionById = new Map(
        (products?.data ?? []).map(product => [product.id, product.unitPrecision])
      )

      const itemsWithSupplier = data.items.map(item => ({
        ...item,
        supplierId: data.supplierId || item.supplierId,
        quantity: toUnitPrecision(
          item.quantity,
          productPrecisionById.get(item.productId) ?? 1
        ),
      }))

      await Promise.all(itemsWithSupplier.map(item => addStock(item)))

      sileo.success({
        title: 'Entrada de inventario agregada correctamente',
      })

      form.reset()
    } catch (error) {
      console.error('Error al agregar entrada de inventario:', error)
      sileo.error({
        title: 'Error al agregar entrada de inventario',
        description: parseError(error),
      })
    }
  }

  return {
    form,
    fieldArray,
    onSubmit,
    addEmptyItem: () => fieldArray.append(EMPTY_INVENTORY_ITEM),
  }
}
