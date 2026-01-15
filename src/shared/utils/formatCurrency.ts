export function formatCurrency(
  value: number,
  currency: 'HNL' | 'USD' = 'HNL',
  locale = 'es-HN'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export const formatLempira = (value?: number | null) => {
  if (value === null || value === undefined) return ''

  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(value)
}

export const parseCurrency = (value: string) => {
  const numeric = value.replace(/[^\d.]/g, '')
  return numeric ? Number(numeric) : 0
}
