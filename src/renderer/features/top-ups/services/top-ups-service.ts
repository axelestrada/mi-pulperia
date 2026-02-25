export const TOP_UPS_UPDATED_EVENT = 'topups-updated'

export interface TopUpRecord {
  id: number
  type: 'balance_load' | 'top_up'
  createdAt: string | Date
  phoneNumber?: string
  operator?: string
  amount: number
  cost: number
  notes?: string
  createdBy?: string
}

export const emitTopUpsUpdated = () => {
  window.dispatchEvent(new CustomEvent(TOP_UPS_UPDATED_EVENT))
}

export const topUpsService = {
  async list(filters?: { dateFrom?: string; dateTo?: string; limit?: number }) {
    return (await window.api.topUps.list(filters)) as TopUpRecord[]
  },
  async getVirtualBalance() {
    return window.api.topUps.getVirtualBalance()
  },
  async getSummary(filters?: { dateFrom?: string; dateTo?: string }) {
    return window.api.topUps.getSummary(filters)
  },
  async register(payload: {
    amount: number
    cost: number
    operator?: string
    phoneNumber?: string
    notes?: string
    createdBy?: string
  }) {
    const result = await window.api.topUps.register(payload)
    emitTopUpsUpdated()
    return result
  },
  async loadBalance(payload: {
    amount: number
    operator?: string
    notes?: string
    createdBy?: string
  }) {
    const result = await window.api.topUps.loadBalance(payload)
    emitTopUpsUpdated()
    return result
  },
}
