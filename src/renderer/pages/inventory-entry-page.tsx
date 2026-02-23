import { PageHeader } from '@/components/ui/page-header'

export const InventoryEntryPage = () => {
  return (
    <>
      <PageHeader
        backButton
        title="Nueva Entrada de Inventario"
        description="Registra nuevos lotes de productos."
      />

      <InventoryEntryForm />
    </>
  )
}
