import {
  InsertCashRegister,
  SelectCashRegister,
} from '../db/schema/cash-registers'
import {
  CashRegistersRepository,
  CashRegistersFilters,
} from '../repositories/cash-registers-repository'

export const CashRegistersService = {
  async list(filters: CashRegistersFilters = {}) {
    return CashRegistersRepository.findAll(filters)
  },

  async getById(id: SelectCashRegister['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash register id')
    }

    const cashRegister = await CashRegistersRepository.findById(id)
    if (!cashRegister) {
      throw new Error('Cash register not found')
    }

    return cashRegister
  },

  async create(input: InsertCashRegister) {
    // Validate required fields
    if (!input.name?.trim()) {
      throw new Error('Cash register name is required')
    }

    return CashRegistersRepository.create({
      ...input,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      location: input.location?.trim() || undefined,
    })
  },

  async update(
    id: SelectCashRegister['id'],
    input: Partial<SelectCashRegister>
  ) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash register id')
    }

    // Check if cash register exists
    const existingCashRegister = await CashRegistersRepository.findById(id)
    if (!existingCashRegister) {
      throw new Error('Cash register not found')
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Cash register name is required')
    }

    return CashRegistersRepository.update(id, {
      ...input,
      name: input.name?.trim(),
      description: input.description?.trim() || undefined,
      location: input.location?.trim() || undefined,
    })
  },

  async remove(id: SelectCashRegister['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash register id')
    }

    const cashRegister = await CashRegistersRepository.findById(id)
    if (!cashRegister) {
      throw new Error('Cash register not found')
    }

    // TODO: Check if cash register has open sessions or associated sales
    // For now, we'll allow deletion

    return CashRegistersRepository.delete(id)
  },

  async activate(id: SelectCashRegister['id']) {
    return this.update(id, { isActive: true })
  },

  async deactivate(id: SelectCashRegister['id']) {
    return this.update(id, { isActive: false })
  },

  async getActiveForSelection() {
    return CashRegistersRepository.findActiveForSelection()
  },

  async ensureDefaultCashRegisterExists() {
    // Check if there are any active cash registers
    const existingRegisters = await CashRegistersRepository.findAll({
      isActive: true,
      limit: 1,
    })

    if (existingRegisters.data.length === 0) {
      // Create a default cash register
      const defaultRegister = await CashRegistersRepository.create({
        name: 'Caja Principal',
        description: 'Caja registradora principal creada automáticamente',
        location: 'Principal',
        isActive: true,
      })

      console.log('Default cash register created:', defaultRegister)
      return defaultRegister
    }

    return existingRegisters.data[0]
  },
}
