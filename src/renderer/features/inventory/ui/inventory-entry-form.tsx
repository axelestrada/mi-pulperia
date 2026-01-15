export const InventoryEntryForm = () => {
  const { form, fieldArray, onSubmit, addEmptyItem } = useInventoryEntryForm()

  const navigate = useNavigate()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border rounded-xl p-4 space-y-4"
      >
        <InventoryEntryFormHeader />

        <InventoryEntryFormFields fieldArray={fieldArray} />

        <Button
          type="button"
          variant="outline"
          onClick={addEmptyItem}
          className="w-full"
        >
          <IconLucidePlus />
          Agregar lote
        </Button>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>

          <Button type="submit">Guardar entrada</Button>
        </div>
      </form>
    </FormProvider>
  )
}
