import { InsertSupplier, SelectSupplier } from '../db/schema/suppliers'
import { SuppliersRepository, SuppliersFilters } from '../repositories/suppliers-repository'

export const SuppliersService = {
  async list(filters: SuppliersFilters = {}) {
    return SuppliersRepository.findAll(filters)
  },

  async getById(id: SelectSupplier['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    const supplier = await SuppliersRepository.findById(id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return supplier
  },

  async getByTaxId(taxId: string) {
    if (!taxId.trim()) {
      throw new Error('Tax ID is required')
    }

    return SuppliersRepository.findByTaxId(taxId)
  },

  async create(input: InsertSupplier) {
    // Validate required fields
    if (!input.name?.trim()) {
      throw new Error('Supplier name is required')
    }

    // Validate tax ID uniqueness if provided
    if (input.taxId) {
      const existingSupplier = await SuppliersRepository.findByTaxId(input.taxId)
      if (existingSupplier) {
        throw new Error('A supplier with this tax ID already exists')
      }
    }

    // Validate email format if provided
    if (input.email && !isValidEmail(input.email)) {
      throw new Error('Invalid email format')
    }

    // Validate credit limit and balance
    if (input.creditLimit && input.creditLimit < 0) {
      throw new Error('Credit limit cannot be negative')
    }

    if (input.currentBalance && input.currentBalance < 0) {
      throw new Error('Current balance cannot be negative')
    }

    // Validate payment terms
    if (input.paymentTerms && input.paymentTerms < 0) {
      throw new Error('Payment terms must be positive')
    }

    return SuppliersRepository.create({
      ...input,
      name: input.name.trim(),
      companyName: input.companyName?.trim() || undefined,
      contactPerson: input.contactPerson?.trim() || undefined,
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() || undefined,
      city: input.city?.trim() || undefined,
      country: input.country?.trim() || undefined,
      taxId: input.taxId?.trim() || undefined,
      bankName: input.bankName?.trim() || undefined,
      bankAccount: input.bankAccount?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      paymentTerms: input.paymentTerms || 30,
      creditLimit: input.creditLimit || 0,
      currentBalance: 0, // Always start with 0 balance
    })
  },

  async update(id: SelectSupplier['id'], input: Partial<SelectSupplier>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    // Check if supplier exists
    const existingSupplier = await SuppliersRepository.findById(id)
    if (!existingSupplier) {
      throw new Error('Supplier not found')
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Supplier name is required')
    }

    // Validate tax ID uniqueness if changed
    if (input.taxId && input.taxId !== existingSupplier.taxId) {
      const supplierWithTaxId = await SuppliersRepository.findByTaxId(input.taxId)
      if (supplierWithTaxId && supplierWithTaxId.id !== id) {
        throw new Error('A supplier with this tax ID already exists')
      }
    }

    // Validate email format if provided
    if (input.email && !isValidEmail(input.email)) {
      throw new Error('Invalid email format')
    }

    // Validate credit limit
    if (input.creditLimit !== undefined && input.creditLimit < 0) {
      throw new Error('Credit limit cannot be negative')
    }

    // Validate payment terms
    if (input.paymentTerms !== undefined && input.paymentTerms < 0) {
      throw new Error('Payment terms must be positive')
    }

    // Prevent direct balance modification through update
    const updateData = { ...input }
    delete updateData.currentBalance

    return SuppliersRepository.update(id, {
      ...updateData,
      name: updateData.name?.trim(),
      companyName: updateData.companyName?.trim() || undefined,
      contactPerson: updateData.contactPerson?.trim() || undefined,
      email: updateData.email?.trim() || undefined,
      phone: updateData.phone?.trim() || undefined,
      address: updateData.address?.trim() || undefined,
      city: updateData.city?.trim() || undefined,
      country: updateData.country?.trim() || undefined,
      taxId: updateData.taxId?.trim() || undefined,
      bankName: updateData.bankName?.trim() || undefined,
      bankAccount: updateData.bankAccount?.trim() || undefined,
      notes: updateData.notes?.trim() || undefined,
    })
  },

  async remove(id: SelectSupplier['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    const supplier = await SuppliersRepository.findById(id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    // Check if supplier has outstanding balance
    if (supplier.currentBalance > 0) {
      throw new Error('Cannot delete supplier with outstanding balance')
    }

    // TODO: Check if supplier has associated purchase orders or inventory batches
    // For now, we'll allow deletion

    return SuppliersRepository.delete(id)
  },

  async updateBalance(id: SelectSupplier['id'], newBalance: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    if (newBalance < 0) {
      throw new Error('Balance cannot be negative')
    }

    const supplier = await SuppliersRepository.findById(id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return SuppliersRepository.updateBalance(id, newBalance)
  },

  async addToBalance(id: SelectSupplier['id'], amount: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const supplier = await SuppliersRepository.findById(id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    const newBalance = supplier.currentBalance + amount

    // Check credit limit
    if (supplier.creditLimit > 0 && newBalance > supplier.creditLimit) {
      throw new Error('This amount would exceed the supplier credit limit')
    }

    return SuppliersRepository.addToBalance(id, amount)
  },

  async subtractFromBalance(id: SelectSupplier['id'], amount: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const supplier = await SuppliersRepository.findById(id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    return SuppliersRepository.subtractFromBalance(id, amount)
  },

  async getActiveForSelection() {
    return SuppliersRepository.findActiveForSelection()
  },

  async getWithOutstandingBalance() {
    return SuppliersRepository.findWithOutstandingBalance()
  },

  async canExtendCredit(id: SelectSupplier['id'], amount: number): Promise<boolean> {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    return SuppliersRepository.canExtendCredit(id, amount)
  },

  async activate(id: SelectSupplier['id']) {
    return this.update(id, { isActive: true })
  },

  async deactivate(id: SelectSupplier['id']) {
    return this.update(id, { isActive: false })
  },

  // Validate supplier for purchase order creation
  async validateForPurchaseOrder(id: SelectSupplier['id']) {
    const supplier = await this.getById(id)

    if (!supplier.isActive) {
      throw new Error('Cannot create purchase orders for inactive suppliers')
    }

    return supplier
  },

  // Get supplier statistics
  async getSupplierStats(id: SelectSupplier['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid supplier id')
    }

    const supplier = await SuppliersRepository.findById(id)
    if (!supplier) {
      throw new Error('Supplier not found')
    }

    // TODO: Calculate statistics from purchase orders, inventory batches, etc.
    // For now, return basic info
    return {
      supplier,
      totalPurchaseOrders: 0,
      totalPurchaseAmount: 0,
      totalInventoryBatches: 0,
      averageDeliveryTime: 0,
      lastPurchaseDate: null,
    }
  },
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
