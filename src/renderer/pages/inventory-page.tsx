import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/page-header'

export const InventoryPage = () => {
  return (
    <>
      <PageHeader
        title="Inventario"
        description="Control de lotes y movimientos."
        actions={
          <Button
            as={Link}
            to="/inventory-entry"
            startContent={<IconLucidePlus />}
            color="default"
            variant="shadow"
            className="bg-foreground text-background"
          >
            Nueva Entrada
          </Button>
        }
      />

      <Tabs className="mb-2">
        <Tab
          key="batches"
          title={
            <div className="flex items-center gap-1">
              <IconSolarBoxLinear /> Lotes
            </div>
          }
        >
          <InventoryBatchesTable />
        </Tab>

        <Tab
          key="movements"
          title={
            <div className="flex items-center gap-1">
              <IconLucideHistory /> Movimientos
            </div>
          }
        >
          <InventoryMovementsTable />
        </Tab>
      </Tabs>
    </>
  )
}
