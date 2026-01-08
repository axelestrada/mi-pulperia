export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: Category['id']) => ['categories', id] as const,
}
