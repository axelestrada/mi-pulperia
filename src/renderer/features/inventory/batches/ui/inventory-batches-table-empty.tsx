export const InventoryBatchesTableEmpty = () => (
  <Empty className="h-full">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <IconLucideFolderOpen />
      </EmptyMedia>
      <EmptyTitle>Aún no has ingresado lotes</EmptyTitle>
      <EmptyDescription>
        Ingresa tu primer lote para comenzar a vender.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <NavLink to="/inventory-entry">
        <Button>
          <IconLucidePlus />
          Nueva Entrada
        </Button>
      </NavLink>
    </EmptyContent>
  </Empty>
)
