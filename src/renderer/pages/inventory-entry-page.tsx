export const InventoryEntryPage = () => {
  return (
    <div>
      <PageHeader
        backButton
        title="Nueva Entrada de Inventario"
        description="Registra nuevos lotes de productos."
      />

      <InventoryEntryForm />
    </div>
  )
}
