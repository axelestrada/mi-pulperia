import { cn } from '@/lib/utils'

type Props = {
  value?: number
  onChange: (value: number) => void
}

export const ProductSelect = ({ value, onChange }: Props) => {
  const { data: products = [] } = useProducts()

  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="max-w-full w-full justify-between font-normal"
        >
          <span className="flex-1 truncate text-left">
            {value ? (
              products.find(product => product.id === Number(value))?.name
            ) : (
              <span className="text-muted-foreground">
                Seleccionar producto...
              </span>
            )}
          </span>

          <IconLucideChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Buscar producto..." className="h-9" />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map(product => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={value => {
                    const product = products.find(p => p.name === value)

                    if (!product) return

                    onChange(product.id)
                    setOpen(false)
                  }}
                >
                  {product.name}
                  <IconLucideCheck
                    className={cn(
                      'ml-auto',
                      value === product.id ? 'opacity-100' : 'opacity-0'
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
