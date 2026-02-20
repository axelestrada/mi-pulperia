export const normalizeUnitPrecision = (unitPrecision: number) => {
  if (!Number.isFinite(unitPrecision)) return 1

  const normalized = Math.round(unitPrecision)
  return normalized > 0 ? normalized : 1
}

export const toUnitPrecision = (value: number, unitPrecision: number) => {
  const precision = normalizeUnitPrecision(unitPrecision)
  const normalizedValue = Number.isFinite(value) ? value : 0

  return Math.round(normalizedValue * precision)
}

export const fromUnitPrecision = (value: number, unitPrecision: number) => {
  const precision = normalizeUnitPrecision(unitPrecision)
  const normalizedValue = Number.isFinite(value) ? value : 0

  return normalizedValue / precision
}

export const getQuantityStep = (unitPrecision: number) => {
  const precision = normalizeUnitPrecision(unitPrecision)
  return 1 / precision
}
