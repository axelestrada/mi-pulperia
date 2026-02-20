import { useEffect } from 'react'

type PaymentShortcutMethod = 'cash' | 'card' | 'transfer'

type UsePOSShortcutsOptions = {
  enabled?: boolean
  isChargeModalOpen: boolean
  focusSearch: () => void
  focusCodeInput: () => void
  addSelectedProduct: () => void
  increaseActiveItemQuantity: () => void
  decreaseActiveItemQuantity: () => void
  removeActiveItem: () => void
  clearCartWithConfirmation: () => void
  openChargeModal: () => void
  selectPaymentMethod: (method: PaymentShortcutMethod) => void
  confirmSale: () => void
  openDiscountModal: () => void
  resumeSavedSale: () => void
  pauseCurrentSale: () => void
  goToCashSession: () => void
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true

  const tagName = target.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
    return true
  }

  return Boolean(target.closest('input, textarea, select, [contenteditable]'))
}

export const usePOSShortcuts = ({
  enabled = true,

  focusSearch,
  focusCodeInput,
  addSelectedProduct,
  increaseActiveItemQuantity,
  decreaseActiveItemQuantity,
  removeActiveItem,
  clearCartWithConfirmation,
  openChargeModal,
  selectPaymentMethod,
  confirmSale,
  openDiscountModal,
  resumeSavedSale,
  pauseCurrentSale,
  goToCashSession,
}: UsePOSShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const editableTarget = isEditableTarget(event.target)
      const key = event.key.toLowerCase()
      const hasCtrl = event.ctrlKey || event.metaKey

      if (event.key === 'F1') {
        event.preventDefault()
        focusSearch()
        return
      }

      if (event.key === 'F2') {
        event.preventDefault()
        focusCodeInput()
        return
      }

      if (event.key === 'F4') {
        event.preventDefault()
        openChargeModal()
        return
      }

      if (event.key === 'F5') {
        event.preventDefault()
        openChargeModal()
        selectPaymentMethod('cash')
        return
      }

      if (event.key === 'F6') {
        event.preventDefault()
        openChargeModal()
        selectPaymentMethod('card')
        return
      }

      if (event.key === 'F7') {
        event.preventDefault()
        openChargeModal()
        selectPaymentMethod('transfer')
        return
      }

      if (hasCtrl && event.shiftKey && key === 'r') {
        event.preventDefault()
        resumeSavedSale()
        return
      }

      if (hasCtrl && key === 's') {
        event.preventDefault()
        pauseCurrentSale()
        return
      }

      if (event.altKey && key === 'x') {
        event.preventDefault()
        goToCashSession()
        return
      }

      if (hasCtrl && key === 'enter') {
        event.preventDefault()
        confirmSale()
        return
      }

      if (hasCtrl && key === 'd') {
        event.preventDefault()
        openDiscountModal()
        return
      }

      if (hasCtrl && key === 'backspace') {
        if (editableTarget) return
        event.preventDefault()
        clearCartWithConfirmation()
        return
      }

      if (editableTarget) return

      if (!hasCtrl && !event.altKey && !event.shiftKey && key === 'enter') {
        event.preventDefault()
        addSelectedProduct()
        return
      }

      if (
        !hasCtrl &&
        !event.altKey &&
        !event.shiftKey &&
        (key === '+' || key === 'add')
      ) {
        event.preventDefault()
        increaseActiveItemQuantity()
        return
      }

      if (
        !hasCtrl &&
        !event.altKey &&
        !event.shiftKey &&
        (key === '-' || key === 'subtract')
      ) {
        event.preventDefault()
        decreaseActiveItemQuantity()
        return
      }

      if (!hasCtrl && !event.altKey && !event.shiftKey && key === 'delete') {
        event.preventDefault()
        removeActiveItem()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [
    addSelectedProduct,
    clearCartWithConfirmation,
    confirmSale,
    decreaseActiveItemQuantity,
    enabled,
    focusCodeInput,
    focusSearch,
    goToCashSession,
    increaseActiveItemQuantity,

    openChargeModal,
    openDiscountModal,
    pauseCurrentSale,
    removeActiveItem,
    resumeSavedSale,
    selectPaymentMethod,
  ])
}

export type { PaymentShortcutMethod }

