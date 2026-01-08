export const productKeys = {
  all: ['products'] as const,
  detail: (id: Product['id']) => ['products', id] as const,
}
