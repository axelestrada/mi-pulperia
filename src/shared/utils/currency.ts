export const toCents = (amount: number) => {
  return Math.round(amount * 100)
}

export const fromCents = (amount: number) => {
  return amount / 100
}
