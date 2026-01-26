import { cn } from '@/lib/utils'

type Props = {
  value?: number
  onChange: (value: number) => void
}

export const SupplierSelect = ({ value, onChange }: Props) => {
  const { data: suppliers = [] } = useActiveSuppliers()

  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          onClick={e => {
            e.preventDefault()
            setOpen(true)
          }}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="max-w-full w-full justify-between font-normal"
        >
          <span className="flex-1 truncate text-left">
            {value ? (
              suppliers.find(product => product.id === Number(value))?.name
            ) : (
              <span className="text-muted-foreground">
                Seleccionar proveedor...
              </span>
            )}
          </span>

          <IconLucideChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar proveedor..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró ningún proveedor.</CommandEmpty>
            <CommandGroup>
              {suppliers.map(supplier => (
                <CommandItem
                  key={supplier.id}
                  value={[supplier.name]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()}
                  onSelect={() => {
                    onChange(supplier.id)
                    setOpen(false)
                  }}
                >
                  {supplier.name}
                  <IconLucideCheck
                    className={cn(
                      'ml-auto',
                      value === supplier.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
