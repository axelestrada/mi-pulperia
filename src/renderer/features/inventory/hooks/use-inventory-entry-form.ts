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
      await Promise.all(data.items.map(item => addStock(item)))
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
