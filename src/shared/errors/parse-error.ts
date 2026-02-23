export const parseError = (error: unknown): string => {
  if (!(error instanceof Error)) return 'Error desconocido'

  const match = error.message.match(/Error:\s*(.*)$/)
  return match ? match[1] : error.message
}
