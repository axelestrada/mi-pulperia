import { db } from '../db'

import {
  categoriesTable,
  type SelectCategory,
  type InsertCategory,
} from '../db/schema/categories'

import { and, eq, inArray, like, or, sql } from 'drizzle-orm'
import { CategoriesListFilters } from 'shared/types/categories'

type FindAllFilters = Required<Pick<CategoriesListFilters, 'page' | 'pageSize'>> &
  Omit<CategoriesListFilters, 'page' | 'pageSize'>

export const CategoriesRepository = {
  findAll: async ({ search, status, page, pageSize }: FindAllFilters) => {
    const whereConditions = [eq(categoriesTable.deleted, false)]

    if (status?.length) {
      const statusValues = status.map(value => value === 'active')
      whereConditions.push(inArray(categoriesTable.isActive, statusValues))
    }

    if (search) {
      const searchCondition = or(
        like(categoriesTable.name, `%${search}%`),
        like(categoriesTable.description, `%${search}%`)
      )

      if (searchCondition) {
        whereConditions.push(searchCondition)
      }
    }

    const offset = (page - 1) * pageSize

    return db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        description: categoriesTable.description,
        isActive: categoriesTable.isActive,
        createdAt: categoriesTable.createdAt,
        updatedAt: categoriesTable.updatedAt,
        deleted: categoriesTable.deleted,
        total: sql<number>`COUNT(*) OVER()`.as('total'),
      })
      .from(categoriesTable)
      .where(and(...whereConditions))
      .orderBy(categoriesTable.name)
      .limit(pageSize)
      .offset(offset)
  },

  create: async (data: InsertCategory) =>
    db.insert(categoriesTable).values(data),

  update: async (id: SelectCategory['id'], data: Partial<SelectCategory>) =>
    db
      .update(categoriesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id)),

  delete: async (id: SelectCategory['id']) =>
    db
      .update(categoriesTable)
      .set({ deleted: true })
      .where(eq(categoriesTable.id, id)),
}
