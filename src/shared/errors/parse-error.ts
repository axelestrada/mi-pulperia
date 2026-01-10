export const parseError = (error: unknown): string | undefined => {
  if (!(error instanceof Error)) return undefined

  const match = error.message.match(/Error:\s*(.*)$/)
  return match ? match[1] : error.message
}
