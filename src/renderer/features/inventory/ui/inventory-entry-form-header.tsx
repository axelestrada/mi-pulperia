export const InventoryEntryFormHeader = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <IconLucidePackage />
        <h3 className="font-semibold leading-none">Productos a Ingresar</h3>
      </div>

      <p className="text-muted-foreground text-sm">
        Cada producto con diferente fecha de vencimiento o costo debe agregarse
        como un lote separado
      </p>
    </div>
  )
}
