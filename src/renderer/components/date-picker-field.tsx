function formatDate(date?: Date) {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

type Props = {
  onChange: (value: Date | null) => void
}

export const DatePickerField = ({ onChange }: Props) => {
  const [date, setDate ] = useState(new Date())
  const [month, setMonth] = useState(new Date())

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null>(null)

  return (
    <div className="relative">
      <Input
        id="date"
        value={value ?? ''}
        placeholder="mm/dd/yyyy"
        className="bg-background pr-10"
        onChange={e => {
          const date = new Date(e.target.value)
          
          setValue(e.target.value)

          if (isValidDate(date)) {
            setDate(date)
            setMonth(date)
            onChange(date)
          }
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="absolute top-1/2 right-0 size-6 -translate-1/2 p-0">
          <Button type="button" variant="ghost" className="size-6">
            <IconLucideCalendar className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" sideOffset={16}>
          <Calendar
            mode="single"
            selected={date}
            month={month}
            onMonthChange={setMonth}
            onSelect={d => {
              onChange(d ?? null)
              setValue(formatDate(d))

              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
