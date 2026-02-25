import { type InsertTopUp } from '../db/schema/top-ups'
import { TopUpsRepository, type TopUpsFilters } from '../repositories/top-ups-repository'

const parseAmount = (value: number) => {
  const n = Number(value)
  if (!Number.isFinite(n) || Number.isNaN(n)) return 0
  return Math.max(0, Math.round(n))
}

export const TopUpsService = {
  async list(filters: TopUpsFilters = {}) {
    return TopUpsRepository.findAll(filters)
  },

  async getVirtualBalance() {
    return TopUpsRepository.getVirtualBalance()
  },

  async loadBalance(input: {
    amount: number
    operator?: string
    notes?: string
    createdBy?: string
  }) {
    const amount = parseAmount(input.amount)
    if (amount <= 0) {
      throw new Error('El monto de recarga de saldo debe ser mayor a 0')
    }

    return TopUpsRepository.create({
      type: 'balance_load',
      amount,
      cost: 0,
      operator: input.operator?.trim() || 'Saldo virtual',
      notes: input.notes?.trim() || 'Recarga de saldo virtual',
      createdBy: input.createdBy?.trim() || 'turno',
    })
  },

  async registerTopUp(input: {
    amount: number
    cost: number
    operator?: string
    phoneNumber?: string
    notes?: string
    createdBy?: string
  }) {
    const amount = parseAmount(input.amount)
    const cost = parseAmount(input.cost)

    if (amount <= 0) {
      throw new Error('El monto de la recarga debe ser mayor a 0')
    }
    if (cost <= 0) {
      throw new Error('El costo de la recarga debe ser mayor a 0')
    }

    const balance = await TopUpsRepository.getVirtualBalance()
    if (cost > balance) {
      throw new Error('Saldo virtual insuficiente para registrar la recarga')
    }

    return TopUpsRepository.create({
      type: 'top_up',
      amount,
      cost,
      operator: input.operator?.trim() || 'Otro',
      phoneNumber: input.phoneNumber?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
      createdBy: input.createdBy?.trim() || 'turno',
    } as InsertTopUp)
  },

  async getSummary(input?: { dateFrom?: string; dateTo?: string }) {
    return TopUpsRepository.getSummary(
      input?.dateFrom ? new Date(input.dateFrom) : undefined,
      input?.dateTo ? new Date(input.dateTo) : undefined
    )
  },
}
