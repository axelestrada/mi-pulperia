import { and, asc, desc, eq, gt, like, or, sql } from 'drizzle-orm'
import { db } from '../db'
import { categoriesTable } from '../db/schema/categories'
import { inventoryBatchesTable } from '../db/schema/inventory-batches'
import { presentationsTable } from '../db/schema/presentations'
import { productsTable } from '../db/schema/products'

export interface POSFilters {
  search?: string
  categoryId?: number
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'salePrice' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface POSPresentation {
  id: number
  name: string
  description: string | null
  image: string | null
  barcode: string | null
  sku: string | null
  salePrice: number
  isBase: boolean
  unit: string
  unitPrecision: number
  factorType: 'fixed' | 'variable'
  factor: number | null
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  availableQuantity: number
  batches: Array<{
    batchId: number
    batchCode: string | null
    expirationDate: Date | null
    availableQuantity: number
    unitCost: number
  }>
}

export const POSRepository = {
  // Get available presentations for POS with FEFO batch information
  getAvailablePresentations: async (filters: POSFilters = {}) => {
    const {
      search,
      categoryId,
      page = 1,
      limit = 30,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = [
      eq(presentationsTable.deleted, false),
      eq(productsTable.deleted, false),
      eq(productsTable.status, 'active'),
      eq(presentationsTable.status, 'active'),
    ]

    if (search) {
      const searchConditions = or(
        like(presentationsTable.name, `%${search}%`),
        like(presentationsTable.description, `%${search}%`),
        like(presentationsTable.barcode, `%${search}%`),
        like(presentationsTable.sku, `%${search}%`),
        like(productsTable.name, `%${search}%`),
        like(productsTable.description, `%${search}%`),
        like(categoriesTable.name, `%${search}%`),
        like(categoriesTable.description, `%${search}%`)
      )

      if (searchConditions) whereConditions.push(searchConditions)
    }

    if (categoryId) {
      whereConditions.push(eq(productsTable.categoryId, categoryId))
    }

    // Build order by
    const getOrderByColumns = () => {
      switch (sortBy) {
        case 'salePrice':
          return [categoriesTable.name, presentationsTable.salePrice]

        case 'createdAt':
          return [categoriesTable.name, presentationsTable.createdAt]

        default:
          return [
            categoriesTable.name,
            productsTable.name,
            presentationsTable.name,
          ]
      }
    }

    const orderColumns = getOrderByColumns()

    const orderBy = orderColumns.map(column =>
      sortOrder === 'desc' ? desc(column) : asc(column)
    )

    // First get the presentations with their basic info and total available quantity
    const presentationsQuery = db
      .select({
        id: presentationsTable.id,
        name: presentationsTable.name,
        description: presentationsTable.description,
        image: presentationsTable.image,
        barcode: presentationsTable.barcode,
        sku: presentationsTable.sku,
        salePrice: presentationsTable.salePrice,
        unit: presentationsTable.unit,
        isBase: presentationsTable.isBase,
        unitPrecision: presentationsTable.unitPrecision,
        factorType: presentationsTable.factorType,
        factor: presentationsTable.factor,
        productId: productsTable.id,
        productName: productsTable.name,
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
        availableQuantity:
          sql<number>`SUM(${inventoryBatchesTable.quantityAvailable})`.as(
            'availableQuantity'
          ),
      })
      .from(presentationsTable)
      .innerJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .innerJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .leftJoin(
        inventoryBatchesTable,
        eq(inventoryBatchesTable.productId, productsTable.id)
      )
      .where(and(...whereConditions))
      .groupBy(productsTable.id, categoriesTable.id, presentationsTable.id)
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset)

    const [presentations, totalResult] = await Promise.all([
      presentationsQuery,
      db
        .select({
          count: sql<number>`COUNT(DISTINCT ${presentationsTable.id})`.as(
            'count'
          ),
        })
        .from(presentationsTable)
        .innerJoin(
          productsTable,
          eq(presentationsTable.productId, productsTable.id)
        )
        .innerJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id)
        )
        .leftJoin(
          inventoryBatchesTable,
          eq(inventoryBatchesTable.productId, productsTable.id)
        )
        .where(and(...whereConditions)),
    ])

    // Get batches for each presentation (FEFO - First Expired, First Out)
    const presentationsWithBatches: POSPresentation[] = await Promise.all(
      presentations.map(async presentation => {
        const batches = await db
          .select({
            batchId: inventoryBatchesTable.id,
            batchCode: inventoryBatchesTable.batchCode,
            expirationDate: inventoryBatchesTable.expirationDate,
            availableQuantity: inventoryBatchesTable.quantityAvailable,
            unitCost: inventoryBatchesTable.unitCost,
          })
          .from(inventoryBatchesTable)
          .where(
            and(
              eq(inventoryBatchesTable.productId, presentation.productId),
              gt(inventoryBatchesTable.quantityAvailable, 0)
            )
          )
          // FEFO: Order by expiration date (nulls last), then by received date
          .orderBy(
            sql`CASE WHEN ${inventoryBatchesTable.expirationDate} IS NULL THEN 1 ELSE 0 END`,
            asc(inventoryBatchesTable.expirationDate),
            asc(inventoryBatchesTable.receivedAt)
          )

        const availableQuantity = Math.max(
          0,
          (presentation.availableQuantity || 0) / (presentation.factor || 1)
        )

        return {
          ...presentation,
          availableQuantity:
            presentation.unitPrecision === 1
              ? Math.floor(availableQuantity)
              : availableQuantity,
          batches: batches.map(batch => ({
            ...batch,
            expirationDate: batch.expirationDate
              ? new Date(batch.expirationDate)
              : null,
          })),
        }
      })
    )

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: presentationsWithBatches,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },

  // Get specific presentation with FEFO batches
  getPresentationWithBatches: async (
    presentationId: number
  ): Promise<POSPresentation | undefined> => {
    const presentation = await db
      .select({
        id: presentationsTable.id,
        name: presentationsTable.name,
        description: presentationsTable.description,
        image: presentationsTable.image,
        barcode: presentationsTable.barcode,
        sku: presentationsTable.sku,
        salePrice: presentationsTable.salePrice,
        unit: presentationsTable.unit,
        unitPrecision: presentationsTable.unitPrecision,
        factorType: presentationsTable.factorType,
        factor: presentationsTable.factor,
        productId: productsTable.id,
        isBase: presentationsTable.isBase,
        productName: productsTable.name,
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
      })
      .from(presentationsTable)
      .innerJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .innerJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .where(
        and(
          eq(presentationsTable.id, presentationId),
          eq(presentationsTable.deleted, false),
          eq(presentationsTable.status, 'active'),
          eq(productsTable.deleted, false),
          eq(productsTable.status, 'active')
        )
      )
      .get()

    if (!presentation) return undefined

    // Get available batches with FEFO ordering
    const batches = await db
      .select({
        batchId: inventoryBatchesTable.id,
        batchCode: inventoryBatchesTable.batchCode,
        expirationDate: inventoryBatchesTable.expirationDate,
        availableQuantity: inventoryBatchesTable.quantityAvailable,
        unitCost: inventoryBatchesTable.unitCost,
      })
      .from(inventoryBatchesTable)
      .where(
        and(
          eq(inventoryBatchesTable.productId, presentation.productId),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      // FEFO: Order by expiration date (nulls last), then by received date
      .orderBy(
        sql`CASE WHEN ${inventoryBatchesTable.expirationDate} IS NULL THEN 1 ELSE 0 END`,
        asc(inventoryBatchesTable.expirationDate),
        asc(inventoryBatchesTable.receivedAt)
      )

    const totalAvailableQuantity = batches.reduce(
      (sum, batch) => sum + batch.availableQuantity,
      0
    )

    return {
      ...presentation,
      availableQuantity: totalAvailableQuantity,
      batches: batches.map(batch => ({
        ...batch,
        expirationDate: batch.expirationDate
          ? new Date(batch.expirationDate)
          : null,
      })),
    }
  },

  // Get FEFO batch allocation for a specific quantity
  getFEFOAllocation: async (productId: number, requestedQuantity: number) => {
    const batches = await db
      .select({
        batchId: inventoryBatchesTable.id,
        batchCode: inventoryBatchesTable.batchCode,
        expirationDate: inventoryBatchesTable.expirationDate,
        availableQuantity: inventoryBatchesTable.quantityAvailable,
        unitCost: inventoryBatchesTable.unitCost,
      })
      .from(inventoryBatchesTable)
      .where(
        and(
          eq(inventoryBatchesTable.productId, productId),
          gt(inventoryBatchesTable.quantityAvailable, 0)
        )
      )
      // FEFO: Order by expiration date (nulls last), then by received date
      .orderBy(
        sql`CASE WHEN ${inventoryBatchesTable.expirationDate} IS NULL THEN 1 ELSE 0 END`,
        asc(inventoryBatchesTable.expirationDate),
        asc(inventoryBatchesTable.receivedAt)
      )

    const allocation: Array<{
      batchId: number
      batchCode?: string
      expirationDate?: Date
      quantity: number
      unitCost: number
    }> = []

    let remainingQuantity = requestedQuantity

    for (const batch of batches) {
      if (remainingQuantity <= 0) break

      const quantityFromBatch = Math.min(
        batch.availableQuantity,
        remainingQuantity
      )

      allocation.push({
        batchId: batch.batchId,
        batchCode: batch.batchCode || undefined,
        expirationDate: batch.expirationDate
          ? new Date(batch.expirationDate)
          : undefined,
        quantity: quantityFromBatch,
        unitCost: batch.unitCost,
      })

      remainingQuantity -= quantityFromBatch
    }

    const totalAllocated = allocation.reduce(
      (sum, item) => sum + item.quantity,
      0
    )
    const isFullyAllocated = totalAllocated >= requestedQuantity

    return {
      allocation,
      totalAllocated,
      isFullyAllocated,
      shortfall: isFullyAllocated ? 0 : requestedQuantity - totalAllocated,
    }
  },

  // Search presentations by barcode or SKU
  searchByCode: async (code: string): Promise<POSPresentation | undefined> => {
    const presentation = await db
      .select({
        id: presentationsTable.id,
        name: presentationsTable.name,
        description: presentationsTable.description,
        image: presentationsTable.image,
        barcode: presentationsTable.barcode,
        sku: presentationsTable.sku,
        salePrice: presentationsTable.salePrice,
        unit: presentationsTable.unit,
        unitPrecision: presentationsTable.unitPrecision,
        factorType: presentationsTable.factorType,
        factor: presentationsTable.factor,
        productId: productsTable.id,
        productName: productsTable.name,
        categoryId: categoriesTable.id,
        categoryName: categoriesTable.name,
      })
      .from(presentationsTable)
      .innerJoin(
        productsTable,
        eq(presentationsTable.productId, productsTable.id)
      )
      .innerJoin(
        categoriesTable,
        eq(productsTable.categoryId, categoriesTable.id)
      )
      .where(
        and(
          or(
            eq(presentationsTable.barcode, code),
            eq(presentationsTable.sku, code)
          ),
          eq(presentationsTable.deleted, false),
          eq(presentationsTable.status, 'active'),
          eq(productsTable.deleted, false),
          eq(productsTable.status, 'active')
        )
      )
      .get()

    if (!presentation) return undefined

    return POSRepository.getPresentationWithBatches(presentation.id)
  },

  // Get categories for filtering
  getCategories: async () => {
    return db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
      })
      .from(categoriesTable)
      .where(
        and(
          eq(categoriesTable.deleted, false),
          eq(categoriesTable.isActive, true)
        )
      )
      .orderBy(asc(categoriesTable.name))
  },
}
