export const InventoryPage = () => {
  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Inventario"
        description="Control de lotes y movimientos."
        actions={
          <Button onClick={() => console.log('Nueva entrada')}>
            <IconLucidePlus /> Nueva Entrada
          </Button>
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
          <ComingSoon />
        </TabsContent>

        <TabsContent value="movements">
          <ComingSoon />
        </TabsContent>
      </Tabs>
    </div>
  )
}
