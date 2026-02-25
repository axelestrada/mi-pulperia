export interface TopUpRecord {
  id: string
  createdAt: string
  phoneNumber?: string
  operator?: string
  amount: number
  cost: number
  notes?: string
  createdBy?: string
}

interface TopUpsState {
  virtualBalance: number
  records: TopUpRecord[]
}

const TOP_UPS_STORAGE_KEY = 'TOP_UPS_STATE_V1'
export const TOP_UPS_UPDATED_EVENT = 'topups-updated'

const defaultState: TopUpsState = {
  virtualBalance: 0,
  records: [],
}

const emitTopUpsUpdated = () => {
  window.dispatchEvent(new CustomEvent(TOP_UPS_UPDATED_EVENT))
}

const parseNumber = (value: unknown) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return 0
  return Math.max(0, Math.round(parsed))
}

export const getTopUpsState = (): TopUpsState => {
  const raw = window.localStorage.getItem(TOP_UPS_STORAGE_KEY)
  if (!raw) return defaultState

  try {
    const parsed = JSON.parse(raw) as Partial<TopUpsState>
    return {
      virtualBalance: parseNumber(parsed.virtualBalance),
      records: Array.isArray(parsed.records) ? parsed.records : [],
    }
  } catch (error) {
    console.error('Error reading top ups state:', error)
    return defaultState
  }
}

const saveTopUpsState = (state: TopUpsState) => {
  window.localStorage.setItem(TOP_UPS_STORAGE_KEY, JSON.stringify(state))
  emitTopUpsUpdated()
}

export const getTopUpRecords = () => getTopUpsState().records

export const getVirtualBalance = () => getTopUpsState().virtualBalance

export const increaseVirtualBalance = (
  amount: number,
  meta?: { operator?: string; notes?: string; createdBy?: string }
) => {
  const safeAmount = parseNumber(amount)
  if (safeAmount <= 0) {
    throw new Error('El monto de recarga de saldo debe ser mayor a 0')
  }

  const currentState = getTopUpsState()
  const nextState: TopUpsState = {
    ...currentState,
    virtualBalance: currentState.virtualBalance + safeAmount,
    records: [
      {
        id: `load-${Date.now()}`,
        createdAt: new Date().toISOString(),
        operator: meta?.operator || 'Saldo virtual',
        amount: safeAmount,
        cost: 0,
        notes: meta?.notes || 'Recarga de saldo virtual',
        createdBy: meta?.createdBy || 'turno',
      },
      ...currentState.records,
    ],
  }

  saveTopUpsState(nextState)
  return nextState
}

export const registerTopUp = (payload: {
  amount: number
  cost: number
  phoneNumber?: string
  operator?: string
  notes?: string
  createdBy?: string
}) => {
  const amount = parseNumber(payload.amount)
  const cost = parseNumber(payload.cost)

  if (amount <= 0) {
    throw new Error('El monto de la recarga debe ser mayor a 0')
  }
  if (cost <= 0) {
    throw new Error('El costo de la recarga debe ser mayor a 0')
  }

  const currentState = getTopUpsState()
  if (cost > currentState.virtualBalance) {
    throw new Error('Saldo virtual insuficiente para registrar la recarga')
  }

  const record: TopUpRecord = {
    id: `topup-${Date.now()}`,
    createdAt: new Date().toISOString(),
    amount,
    cost,
    phoneNumber: payload.phoneNumber?.trim() || undefined,
    operator: payload.operator?.trim() || undefined,
    notes: payload.notes?.trim() || undefined,
    createdBy: payload.createdBy?.trim() || 'turno',
  }

  const nextState: TopUpsState = {
    virtualBalance: currentState.virtualBalance - cost,
    records: [record, ...currentState.records],
  }

  saveTopUpsState(nextState)
  return record
}
