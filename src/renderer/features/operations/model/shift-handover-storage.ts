export type ShiftModuleKey =
  | 'credits'
  | 'cash'
  | 'expenses'
  | 'reports'
  | 'purchase-orders'
  | 'top-ups'

const SHIFT_HANDOVER_KEY = 'SHIFT_HANDOVER_NOTES_V1'
export const SHIFT_HANDOVER_UPDATED_EVENT = 'shift-handover-updated'

type ShiftNotesState = Partial<Record<ShiftModuleKey, string>>

const getState = (): ShiftNotesState => {
  const raw = window.localStorage.getItem(SHIFT_HANDOVER_KEY)
  if (!raw) return {}

  try {
    return JSON.parse(raw) as ShiftNotesState
  } catch (error) {
    console.error('Error reading shift notes:', error)
    return {}
  }
}

const saveState = (state: ShiftNotesState) => {
  window.localStorage.setItem(SHIFT_HANDOVER_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(SHIFT_HANDOVER_UPDATED_EVENT))
}

export const getShiftModuleNote = (module: ShiftModuleKey) =>
  getState()[module] || ''

export const setShiftModuleNote = (module: ShiftModuleKey, note: string) => {
  const state = getState()
  saveState({
    ...state,
    [module]: note.trim(),
  })
}
