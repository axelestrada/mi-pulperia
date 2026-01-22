type Option = {
  value: string
  label: string
}

type Props = {
  title: string
  options: Option[]
  value: string[]
  onChange: (values: string[]) => void
}

export const TableFacetedFilter = ({
  title,
  options,
  value,
  onChange,
}: Props) => {
  const selectedValues = new Set(value)

  const toggle = (val: string) => {
    const next = new Set(selectedValues)

    next.has(val) ? next.delete(val) : next.add(val)

    onChange(Array.from(next))
  }

  const clear = () => onChange([])

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline" className="border-dashed">
          <IconLucidePlusCircle />
          {title}

          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal"
              >
                {selectedValues.size}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-55 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Filtrar ${title}`} />
          <CommandList>
            <CommandEmpty>No hay resultados</CommandEmpty>

            <CommandGroup>
              {options.map(option => {
                const isSelected = selectedValues.has(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggle(option.value)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clear}
                    className="justify-center text-center"
                  >
                    Limpiar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
