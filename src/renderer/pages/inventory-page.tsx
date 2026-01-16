export const InventoryPage = () => {
  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Inventario"
        description="Control de lotes y movimientos."
        actions={
          <NavLink to="/inventory-entry">
            <Button>
              <IconLucidePlus /> Nueva Entrada
            </Button>
          </NavLink>
        }
      />

      <Tabs defaultValue="batches" className="flex-1">
        <TabsList className="mb-2">
          <TabsTrigger value="batches">
            <IconLucidePackage /> Lotes
          </TabsTrigger>
          <TabsTrigger value="movements">
            <IconLucideHistory /> Movimientos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="batches">
          <InventoryBatchesTable filters={{}} />
        </TabsContent>

        <TabsContent value="movements">
          <ComingSoon />
        </TabsContent>
      </Tabs>
    </div>
  )
}
