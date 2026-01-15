export const inventoryKeys = {
  all: ['inventory'] as const,

  stock: (productId: number) =>
    [...inventoryKeys.all, 'stock', productId] as const,
}