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