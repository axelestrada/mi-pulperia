type Props = {
  value?: number
  onChange: (value: number) => void
}

export const CurrencyInput = ({ value, onChange }: Props) => {
  return (
    <Input
      inputMode="decimal"
      value={formatLempira(value)}
      onChange={e => {
        onChange(parseCurrency(e.target.value))
      }}
      placeholder="L 0.00"
    />
  )
}
