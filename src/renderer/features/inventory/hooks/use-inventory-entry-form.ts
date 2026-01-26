export const useInventoryEntryForm = () => {
  const { mutateAsync: addStock } = useAddStock()

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
      // Apply supplier to all items if selected
      const itemsWithSupplier = data.items.map(item => ({
        ...item,
        supplierId: data.supplierId || item.supplierId,
      }))

      await Promise.all(itemsWithSupplier.map(item => addStock(item)))
      toast.success('Entrada de inventario agregada correctamente')

      form.reset()
    } catch (error) {
      console.error('Error al agregar entrada de inventario:', error)
      toast.error('Error al agregar entrada de inventario')
    }
  }

  return {
    form,
    fieldArray,
    onSubmit,
    addEmptyItem: () => fieldArray.append(EMPTY_INVENTORY_ITEM),
  }
}
