import { db } from '../db'
import { eq, and, like, or, desc, asc, count } from 'drizzle-orm'

import {
  configurationTable,
  type SelectConfiguration,
  type InsertConfiguration,
} from '../db/schema/configuration'

export interface ConfigurationFilters {
  search?: string
  category?: 'general' | 'tax' | 'inventory' | 'pos' | 'reports' | 'notifications' | 'security' | 'integrations'
  isEditable?: boolean
  isVisible?: boolean
  page?: number
  limit?: number
  sortBy?: 'key' | 'category' | 'label' | 'sortOrder'
  sortOrder?: 'asc' | 'desc'
}

export interface ConfigurationValue {
  key: string
  value: any
  dataType: 'string' | 'number' | 'boolean' | 'json'
}

export const ConfigurationRepository = {
  findAll: async (filters: ConfigurationFilters = {}) => {
    const {
      search,
      category,
      isEditable,
      isVisible,
      page = 1,
      limit = 100,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = filters

    const offset = (page - 1) * limit

    // Build where conditions
    const whereConditions = []

    if (search) {
      whereConditions.push(
        or(
          like(configurationTable.key, `%${search}%`),
          like(configurationTable.label, `%${search}%`),
          like(configurationTable.description, `%${search}%`)
        )!
      )
    }

    if (category) {
      whereConditions.push(eq(configurationTable.category, category))
    }

    if (isEditable !== undefined) {
      whereConditions.push(eq(configurationTable.isEditable, isEditable))
    }

    if (isVisible !== undefined) {
      whereConditions.push(eq(configurationTable.isVisible, isVisible))
    }

    // Build order by
    const orderBy =
      sortOrder === 'desc'
        ? desc(configurationTable[sortBy])
        : asc(configurationTable[sortBy])

    const [configurations, totalResult] = await Promise.all([
      db
        .select()
        .from(configurationTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),

      db
        .select({ count: count() })
        .from(configurationTable)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined),
    ])

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: configurations,
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

  findByKey: async (key: string) =>
    db
      .select()
      .from(configurationTable)
      .where(eq(configurationTable.key, key))
      .get(),

  findById: async (id: SelectConfiguration['id']) =>
    db
      .select()
      .from(configurationTable)
      .where(eq(configurationTable.id, id))
      .get(),

  create: async (data: InsertConfiguration) => {
    const result = await db
      .insert(configurationTable)
      .values(data)
      .returning()

    return result[0]
  },

  update: async (id: SelectConfiguration['id'], data: Partial<SelectConfiguration>) =>
    db
      .update(configurationTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(configurationTable.id, id))
      .returning(),

  updateByKey: async (key: string, value: string) =>
    db
      .update(configurationTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(configurationTable.key, key))
      .returning(),

  delete: async (id: SelectConfiguration['id']) =>
    db
      .delete(configurationTable)
      .where(eq(configurationTable.id, id)),

  // Get configuration value with proper type parsing
  getValue: async <T = any>(key: string, defaultValue?: T): Promise<T> => {
    const config = await db
      .select()
      .from(configurationTable)
      .where(eq(configurationTable.key, key))
      .get()

    if (!config) {
      return defaultValue as T
    }

    if (!config.value) {
      return (config.defaultValue ? parseConfigValue(config.defaultValue, config.dataType) : defaultValue) as T
    }

    return parseConfigValue(config.value, config.dataType) as T
  },

  // Set configuration value with proper type serialization
  setValue: async (key: string, value: any) => {
    const config = await db
      .select()
      .from(configurationTable)
      .where(eq(configurationTable.key, key))
      .get()

    if (!config) {
      throw new Error(`Configuration key '${key}' not found`)
    }

    const serializedValue = serializeConfigValue(value, config.dataType)

    return db
      .update(configurationTable)
      .set({ value: serializedValue, updatedAt: new Date() })
      .where(eq(configurationTable.key, key))
      .returning()
  },

  // Get all configurations as key-value pairs
  getAllValues: async (): Promise<Record<string, any>> => {
    const configurations = await db
      .select()
      .from(configurationTable)

    const result: Record<string, any> = {}

    for (const config of configurations) {
      const value = config.value || config.defaultValue
      if (value) {
        result[config.key] = parseConfigValue(value, config.dataType)
      }
    }

    return result
  },

  // Get configurations by category
  getByCategory: async (category: SelectConfiguration['category']) =>
    db
      .select()
      .from(configurationTable)
      .where(eq(configurationTable.category, category))
      .orderBy(asc(configurationTable.sortOrder)),

  // Get editable configurations for settings UI
  getEditableConfigurations: async () =>
    db
      .select()
      .from(configurationTable)
      .where(and(
        eq(configurationTable.isEditable, true),
        eq(configurationTable.isVisible, true)
      ))
      .orderBy(asc(configurationTable.category), asc(configurationTable.sortOrder)),

  // Batch update configurations
  batchUpdate: async (updates: Array<{ key: string; value: any }>) => {
      const results = []

      for (const update of updates) {
        const config = await db
          .select()
          .from(configurationTable)
          .where(eq(configurationTable.key, update.key))
          .get()

        if (config) {
          const serializedValue = serializeConfigValue(update.value, config.dataType)
          const result = await db
            .update(configurationTable)
            .set({ value: serializedValue, updatedAt: new Date() })
            .where(eq(configurationTable.key, update.key))
            .returning()

          results.push(result[0])
        }
      }

      return results
    
  },

  // Initialize default configurations
  initializeDefaults: async () => {
    const defaultConfigs: InsertConfiguration[] = [
      // General settings
      {
        key: 'company_name',
        value: 'Mi Pulpería',
        dataType: 'string',
        category: 'general',
        label: 'Nombre de la Empresa',
        description: 'Nombre que aparecerá en reportes y facturas',
        defaultValue: 'Mi Pulpería',
        isRequired: true,
        inputType: 'text',
        sortOrder: 1,
      },
      {
        key: 'company_address',
        value: '',
        dataType: 'string',
        category: 'general',
        label: 'Dirección de la Empresa',
        description: 'Dirección física de la empresa',
        defaultValue: '',
        inputType: 'textarea',
        sortOrder: 2,
      },
      {
        key: 'company_phone',
        value: '',
        dataType: 'string',
        category: 'general',
        label: 'Teléfono de la Empresa',
        description: 'Número de teléfono principal',
        defaultValue: '',
        inputType: 'text',
        sortOrder: 3,
      },
      {
        key: 'company_email',
        value: '',
        dataType: 'string',
        category: 'general',
        label: 'Email de la Empresa',
        description: 'Correo electrónico principal',
        defaultValue: '',
        inputType: 'text',
        sortOrder: 4,
      },

      // Tax settings
      {
        key: 'default_tax_rate',
        value: '15',
        dataType: 'number',
        category: 'tax',
        label: 'Tasa de Impuesto por Defecto (%)',
        description: 'Porcentaje de impuesto que se aplicará por defecto',
        defaultValue: '15',
        inputType: 'number',
        validationRules: '{"min": 0, "max": 100}',
        sortOrder: 1,
      },
      {
        key: 'tax_included_in_prices',
        value: 'false',
        dataType: 'boolean',
        category: 'tax',
        label: 'Impuesto Incluido en Precios',
        description: 'Si está habilitado, los precios ya incluyen impuestos',
        defaultValue: 'false',
        inputType: 'boolean',
        sortOrder: 2,
      },

      // Inventory settings
      {
        key: 'low_stock_threshold',
        value: '5',
        dataType: 'number',
        category: 'inventory',
        label: 'Umbral de Stock Bajo',
        description: 'Cantidad mínima para considerar un producto con stock bajo',
        defaultValue: '5',
        inputType: 'number',
        validationRules: '{"min": 0}',
        sortOrder: 1,
      },
      {
        key: 'enable_batch_tracking',
        value: 'true',
        dataType: 'boolean',
        category: 'inventory',
        label: 'Habilitar Seguimiento de Lotes',
        description: 'Permite el manejo de lotes e inventario FEFO',
        defaultValue: 'true',
        inputType: 'boolean',
        sortOrder: 2,
      },
      {
        key: 'auto_adjust_inventory',
        value: 'true',
        dataType: 'boolean',
        category: 'inventory',
        label: 'Ajustar Inventario Automáticamente',
        description: 'Ajusta el inventario automáticamente en las ventas',
        defaultValue: 'true',
        inputType: 'boolean',
        sortOrder: 3,
      },

      // POS settings
      {
        key: 'require_customer_for_credit',
        value: 'true',
        dataType: 'boolean',
        category: 'pos',
        label: 'Requerir Cliente para Crédito',
        description: 'Obligar a seleccionar un cliente para ventas a crédito',
        defaultValue: 'true',
        inputType: 'boolean',
        sortOrder: 1,
      },
      {
        key: 'print_receipt_automatically',
        value: 'false',
        dataType: 'boolean',
        category: 'pos',
        label: 'Imprimir Recibo Automáticamente',
        description: 'Imprime el recibo automáticamente después de cada venta',
        defaultValue: 'false',
        inputType: 'boolean',
        sortOrder: 2,
      },
      {
        key: 'pos_grid_columns',
        value: '4',
        dataType: 'number',
        category: 'pos',
        label: 'Columnas en Vista de Cuadrícula',
        description: 'Número de columnas en la vista de productos del POS',
        defaultValue: '4',
        inputType: 'number',
        validationRules: '{"min": 2, "max": 8}',
        sortOrder: 3,
      },

      // Currency settings
      {
        key: 'default_currency',
        value: 'HNL',
        dataType: 'string',
        category: 'general',
        label: 'Moneda por Defecto',
        description: 'Código de moneda (ISO 4217)',
        defaultValue: 'HNL',
        inputType: 'select',
        inputOptions: '[{"value": "HNL", "label": "Lempira (HNL)"}, {"value": "USD", "label": "Dólar (USD)"}]',
        sortOrder: 5,
      },
    ]

    // Insert only if they don't exist
    for (const config of defaultConfigs) {
      const existing = await db
        .select()
        .from(configurationTable)
        .where(eq(configurationTable.key, config.key))
        .get()

      if (!existing) {
        await db.insert(configurationTable).values(config)
      }
    }
  },
}

// Helper functions for type conversion
function parseConfigValue(value: string, dataType: SelectConfiguration['dataType']): any {
  switch (dataType) {
    case 'number':
      return parseFloat(value)
    case 'boolean':
      return value === 'true' || value === '1'
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    case 'string':
    default:
      return value
  }
}

function serializeConfigValue(value: any, dataType: SelectConfiguration['dataType']): string {
  switch (dataType) {
    case 'number':
      return String(value)
    case 'boolean':
      return value ? 'true' : 'false'
    case 'json':
      return JSON.stringify(value)
    case 'string':
    default:
      return String(value)
  }
}
