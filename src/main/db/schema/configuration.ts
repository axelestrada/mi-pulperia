import { sql } from 'drizzle-orm'
import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const configurationTable = sqliteTable('configuration', {
  id: int().primaryKey({ autoIncrement: true }),

  key: text().notNull().unique(),
  value: text(),

  // Data type for proper parsing
  dataType: text('data_type')
    .$type<'string' | 'number' | 'boolean' | 'json'>()
    .notNull()
    .default('string'),

  // Configuration category for grouping
  category: text()
    .$type<'general' | 'tax' | 'inventory' | 'pos' | 'reports' | 'notifications' | 'security' | 'integrations'>()
    .notNull()
    .default('general'),

  // Human readable label and description
  label: text().notNull(),
  description: text(),

  // Default value
  defaultValue: text('default_value'),

  // Whether this setting is required
  isRequired: int('is_required', { mode: 'boolean' }).notNull().default(false),

  // Whether this setting is editable by users
  isEditable: int('is_editable', { mode: 'boolean' }).notNull().default(true),

  // Whether this setting is visible in UI
  isVisible: int('is_visible', { mode: 'boolean' }).notNull().default(true),

  // Display order within category
  sortOrder: int('sort_order').notNull().default(0),

  // Validation rules (JSON string)
  validationRules: text('validation_rules'),

  // Input type for UI rendering
  inputType: text('input_type')
    .$type<'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'password' | 'file' | 'color' | 'date'>()
    .notNull()
    .default('text'),

  // Options for select inputs (JSON string)
  inputOptions: text('input_options'),

  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type SelectConfiguration = typeof configurationTable.$inferSelect
export type InsertConfiguration = typeof configurationTable.$inferInsert
