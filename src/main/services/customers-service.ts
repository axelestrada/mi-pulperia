import { InsertCustomer, SelectCustomer } from '../db/schema/customers'
import { CustomersRepository, CustomersFilters } from '../repositories/customers-repository'

export const CustomersService = {
  async list(filters: CustomersFilters = {}) {
    return CustomersRepository.findAll(filters)
  },

  async getById(id: SelectCustomer['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    const customer = await CustomersRepository.findById(id)
    if (!customer) {
      throw new Error('Customer not found')
    }

    return customer
  },

  async getByDocument(document: string) {
    if (!document.trim()) {
      throw new Error('Document is required')
    }

    return CustomersRepository.findByDocument(document)
  },

  async create(input: InsertCustomer) {
    // Validate required fields
    if (!input.name?.trim()) {
      throw new Error('Customer name is required')
    }

    // Validate document if provided
    if (input.document) {
      const existingCustomer = await CustomersRepository.findByDocument(input.document)
      if (existingCustomer) {
        throw new Error('A customer with this document already exists')
      }
    }

    // Validate email format if provided
    if (input.email && !isValidEmail(input.email)) {
      throw new Error('Invalid email format')
    }

    // Validate credit limit
    if (input.creditLimit && input.creditLimit < 0) {
      throw new Error('Credit limit cannot be negative')
    }

    return CustomersRepository.create({
      ...input,
      name: input.name.trim(),
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() || undefined,
      city: input.city?.trim() || undefined,
      creditLimit: input.creditLimit || 0,
      currentBalance: 0, // Always start with 0 balance
    })
  },

  async update(id: SelectCustomer['id'], input: Partial<SelectCustomer>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    // Check if customer exists
    const existingCustomer = await CustomersRepository.findById(id)
    if (!existingCustomer) {
      throw new Error('Customer not found')
    }

    // Validate name if provided
    if (input.name !== undefined && !input.name.trim()) {
      throw new Error('Customer name is required')
    }

    // Validate document uniqueness if changed
    if (input.document && input.document !== existingCustomer.document) {
      const customerWithDocument = await CustomersRepository.findByDocument(input.document)
      if (customerWithDocument && customerWithDocument.id !== id) {
        throw new Error('A customer with this document already exists')
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

    // Prevent direct balance modification through update
    const updateData = { ...input }
    delete updateData.currentBalance

    return CustomersRepository.update(id, {
      ...updateData,
      name: updateData.name?.trim(),
      email: updateData.email?.trim() || undefined,
      phone: updateData.phone?.trim() || undefined,
      address: updateData.address?.trim() || undefined,
      city: updateData.city?.trim() || undefined,
    })
  },

  async remove(id: SelectCustomer['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    const customer = await CustomersRepository.findById(id)
    if (!customer) {
      throw new Error('Customer not found')
    }

    // Check if customer has outstanding balance
    if (customer.currentBalance > 0) {
      throw new Error('Cannot delete customer with outstanding balance')
    }

    return CustomersRepository.delete(id)
  },

  async updateBalance(id: SelectCustomer['id'], newBalance: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    if (newBalance < 0) {
      throw new Error('Balance cannot be negative')
    }

    const customer = await CustomersRepository.findById(id)
    if (!customer) {
      throw new Error('Customer not found')
    }

    return CustomersRepository.updateBalance(id, newBalance)
  },

  async addToBalance(id: SelectCustomer['id'], amount: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const customer = await CustomersRepository.findById(id)
    if (!customer) {
      throw new Error('Customer not found')
    }

    const newBalance = customer.currentBalance + amount
    return CustomersRepository.updateBalance(id, newBalance)
  },

  async subtractFromBalance(id: SelectCustomer['id'], amount: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const customer = await CustomersRepository.findById(id)
    if (!customer) {
      throw new Error('Customer not found')
    }

    const newBalance = customer.currentBalance - amount
    if (newBalance < 0) {
      throw new Error('Insufficient balance')
    }

    return CustomersRepository.updateBalance(id, newBalance)
  },

  async getActiveForSelection() {
    return CustomersRepository.findActiveForSelection()
  },

  async getWithOutstandingBalance() {
    return CustomersRepository.findWithOutstandingBalance()
  },

  async canExtendCredit(id: SelectCustomer['id'], amount: number): Promise<boolean> {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid customer id')
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const customer = await CustomersRepository.findById(id)
    if (!customer) {
      throw new Error('Customer not found')
    }

    if (!customer.isActive) {
      return false
    }

    const newBalance = customer.currentBalance + amount
    return newBalance <= customer.creditLimit
  },
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
