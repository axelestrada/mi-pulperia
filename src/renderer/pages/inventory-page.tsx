import { PageHeader } from '@/components/ui/page-header'

export const InventoryPage = () => {
  return (
    <>
      <PageHeader
        title="Inventario"
        description="Control de lotes y movimientos."
        actions={
          <Button
            startContent={<IconLucidePlus />}
            color="default"
            variant="shadow"
            className="bg-foreground text-background"
          >
            Nueva Entrada
          </Button>
        }
      />

      <Tabs>
        <Tab
          key="batches"
          title={
            <div className="flex items-center gap-1">
              <IconSolarBoxLinear /> Lotes
            </div>
          }
        >
          <InventoryBatchesTable filters={{}} />
        </Tab>

        <Tab
          key="movements"
          title={
            <div className="flex items-center gap-1">
              <IconLucideHistory /> Movimientos
            </div>
          }
        >
          <ComingSoon />
        </Tab>
      </Tabs>
    </>
  )
}
