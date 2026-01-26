import { InsertPurchaseOrder, SelectPurchaseOrder } from '../db/schema/purchase-orders'
import { PurchaseOrdersRepository, PurchaseOrdersFilters, CreatePurchaseOrderData } from '../repositories/purchase-orders-repository'
import { SuppliersService } from './suppliers-service'
import { InventoryBatchesRepository } from '../repositories/inventory-batches-repository'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import { InsertInventoryBatch } from '../db/schema/inventory-batches'
import { InsertInventoryMovement } from '../db/schema/inventory-movements'

export const PurchaseOrdersService = {
  async list(filters: PurchaseOrdersFilters = {}) {
    return PurchaseOrdersRepository.findAll(filters)
  },

  async getById(id: SelectPurchaseOrder['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid purchase order id')
    }

    const order = await PurchaseOrdersRepository.findById(id)
    if (!order) {
      throw new Error('Purchase order not found')
    }

    return order
  },

  async create(data: CreatePurchaseOrderData) {
    // Validate supplier
    await SuppliersService.validateForPurchaseOrder(data.order.supplierId)

    // Validate order data
    if (!data.order.createdBy?.trim()) {
      throw new Error('Created by is required')
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('Purchase order must have at least one item')
    }

    // Validate items
    for (const item of data.items) {
      if (!Number.isInteger(item.presentationId)) {
        throw new Error('Invalid presentation id')
      }

      if (item.quantity <= 0) {
        throw new Error('Item quantity must be positive')
      }

      if (item.unitCost < 0) {
        throw new Error('Item unit cost cannot be negative')
      }

      // Validate discount
      if (item.discount && item.discount < 0) {
        throw new Error('Item discount cannot be negative')
      }

      if (item.discountType === 'percentage' && item.discount && item.discount > 100) {
        throw new Error('Percentage discount cannot be greater than 100%')
      }
    }

    // Calculate totals
    let subtotal = 0
    for (const item of data.items) {
      let itemTotal = item.quantity * item.unitCost

      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemTotal = itemTotal * (1 - item.discount / 100)
        } else {
          itemTotal = Math.max(0, itemTotal - item.discount)
        }
      }

      subtotal += itemTotal
    }

    const total = subtotal + (data.order.taxAmount || 0) + (data.order.shippingAmount || 0) - (data.order.discountAmount || 0)

    // Generate order number if not provided
    if (!data.order.orderNumber) {
      data.order.orderNumber = await PurchaseOrdersRepository.generateOrderNumber()
    }

    // Set calculated totals
    data.order.subtotal = Math.round(subtotal * 100) / 100
    data.order.total = Math.round(total * 100) / 100

    // Create the order
    const order = await PurchaseOrdersRepository.create(data)

    return {
      order,
      orderDetails: await PurchaseOrdersRepository.findById(order.id),
    }
  },

  async update(id: SelectPurchaseOrder['id'], data: Partial<SelectPurchaseOrder>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid purchase order id')
    }

    const existingOrder = await PurchaseOrdersRepository.findById(id)
    if (!existingOrder) {
      throw new Error('Purchase order not found')
    }

    // Only allow updates if order is in draft status
    if (existingOrder.status !== 'draft') {
      throw new Error('Can only update draft purchase orders')
    }

    // Only allow certain fields to be updated
    const allowedFields = ['notes', 'internalNotes', 'expectedDeliveryDate']
    const updateData: Partial<SelectPurchaseOrder> = {}

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields to update')
    }

    return PurchaseOrdersRepository.update(id, updateData)
  },

  async send(id: SelectPurchaseOrder['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid purchase order id')
    }

    const order = await PurchaseOrdersRepository.findById(id)
    if (!order) {
      throw new Error('Purchase order not found')
    }

    if (order.status !== 'draft') {
      throw new Error('Only draft purchase orders can be sent')
    }

    return PurchaseOrdersRepository.updateStatus(id, 'sent')
  },

  async cancel(id: SelectPurchaseOrder['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid purchase order id')
    }

    const order = await PurchaseOrdersRepository.findById(id)
    if (!order) {
      throw new Error('Purchase order not found')
    }

    if (order.status === 'completed') {
      throw new Error('Cannot cancel completed purchase orders')
    }

    return PurchaseOrdersRepository.updateStatus(id, 'cancelled')
  },

  async receiveItems(
    orderId: SelectPurchaseOrder['id'],
    receivedItems: Array<{
      itemId: number
      quantityReceived: number
      batchCode?: string
      expirationDate?: Date
      actualUnitCost?: number
      notes?: string
    }>
  ) {
    if (!Number.isInteger(orderId)) {
      throw new Error('Invalid purchase order id')
    }

    const order = await PurchaseOrdersRepository.findById(orderId)
    if (!order) {
      throw new Error('Purchase order not found')
    }

    if (order.status !== 'sent' && order.status !== 'partial') {
      throw new Error('Can only receive items for sent or partially received orders')
    }

    if (!receivedItems || receivedItems.length === 0) {
      throw new Error('Must specify items to receive')
    }

    // Process each received item
    for (const receivedItem of receivedItems) {
      if (receivedItem.quantityReceived <= 0) {
        throw new Error('Received quantity must be positive')
      }

      // Find the order item
      const orderItem = order.items?.find(item => item.id === receivedItem.itemId)
      if (!orderItem) {
        throw new Error(`Order item with id ${receivedItem.itemId} not found`)
      }

      // Check if we're not receiving more than ordered
      const newTotalReceived = orderItem.quantityReceived + receivedItem.quantityReceived
      if (newTotalReceived > orderItem.quantity) {
        throw new Error(`Cannot receive more than ordered quantity for item ${orderItem.presentationName}`)
      }

      // Update the order item
      await PurchaseOrdersRepository.updateItemReceived(receivedItem.itemId, receivedItem.quantityReceived)

      // Create inventory batch
      const batchData: InsertInventoryBatch = {
        productId: orderItem.presentationId, // This should be the product ID, but we'll use presentation for now
        supplierId: order.supplierId,
        batchCode: receivedItem.batchCode,
        expirationDate: receivedItem.expirationDate,
        quantityInitial: receivedItem.quantityReceived,
        quantityAvailable: receivedItem.quantityReceived,
        unitCost: receivedItem.actualUnitCost || orderItem.unitCost,
      }

      const batch = await InventoryBatchesRepository.create(batchData)

      // Create inventory movement
      const movementData: InsertInventoryMovement = {
        productId: orderItem.presentationId,
        batchId: batch.id,
        type: 'IN',
        quantity: receivedItem.quantityReceived,
        reason: 'Purchase Order Receipt',
        referenceType: 'purchase_order',
        referenceId: orderId,
      }

      await InventoryMovementsRepository.create(movementData)
    }

    // Update order status based on completion
    const updatedOrder = await PurchaseOrdersRepository.findById(orderId)
    if (updatedOrder?.items) {
      const allItemsReceived = updatedOrder.items.every(item => item.quantityPending === 0)
      const someItemsReceived = updatedOrder.items.some(item => item.quantityReceived > 0)

      let newStatus: SelectPurchaseOrder['status'] = 'sent'
      if (allItemsReceived) {
        newStatus = 'completed'
      } else if (someItemsReceived) {
        newStatus = 'partial'
      }

      await PurchaseOrdersRepository.updateStatus(orderId, newStatus)
    }

    return {
      success: true,
      message: 'Items received successfully',
      order: await PurchaseOrdersRepository.findById(orderId),
    }
  },

  async delete(id: SelectPurchaseOrder['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid purchase order id')
    }

    const order = await PurchaseOrdersRepository.findById(id)
    if (!order) {
      throw new Error('Purchase order not found')
    }

    if (order.status === 'completed') {
      throw new Error('Cannot delete completed purchase orders')
    }

    if (order.status === 'partial') {
      throw new Error('Cannot delete partially received purchase orders')
    }

    return PurchaseOrdersRepository.delete(id)
  },

  async getOrdersForSupplier(supplierId: number) {
    if (!Number.isInteger(supplierId)) {
      throw new Error('Invalid supplier id')
    }

    return PurchaseOrdersRepository.getOrdersForSupplier(supplierId)
  },

  async getPendingOrders() {
    return PurchaseOrdersRepository.findPendingOrders()
  },

  async getOrdersStats(dateFrom?: Date, dateTo?: Date) {
    if (dateFrom && !(dateFrom instanceof Date)) {
      throw new Error('Invalid date from')
    }

    if (dateTo && !(dateTo instanceof Date)) {
      throw new Error('Invalid date to')
    }

    if (dateFrom && dateTo && dateFrom > dateTo) {
      throw new Error('Date from cannot be after date to')
    }

    return PurchaseOrdersRepository.getOrdersStats(dateFrom, dateTo)
  },

  // Helper method to calculate order totals
  calculateOrderTotals(
    items: Array<{ quantity: number; unitCost: number; discount?: number; discountType?: 'fixed' | 'percentage' }>,
    taxRate: number = 0,
    discountAmount: number = 0,
    shippingAmount: number = 0
  ) {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        shippingAmount: 0,
        total: 0,
        totalItems: 0,
      }
    }

    let subtotal = 0
    let totalItems = 0

    for (const item of items) {
      let itemTotal = item.quantity * item.unitCost

      // Apply item discount if present
      if (item.discount && item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemTotal = itemTotal * (1 - item.discount / 100)
        } else {
          itemTotal = Math.max(0, itemTotal - item.discount)
        }
      }

      subtotal += itemTotal
      totalItems += item.quantity
    }

    const taxAmount = subtotal * (taxRate / 100)
    const total = subtotal + taxAmount + shippingAmount - discountAmount

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      shippingAmount: Math.round(shippingAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalItems,
    }
  },

  // Generate shopping list from low stock products
  async generateShoppingList(supplierId?: number, categoryId?: number) {
    // TODO: Implement logic to find products with low stock
    // and create a suggested purchase order

    // This would involve:
    // 1. Finding products below minimum stock levels
    // 2. Calculating suggested order quantities
    // 3. Grouping by supplier if needed
    // 4. Creating draft purchase order(s)

    // For now, return empty structure
    return {
      suggestions: [],
      totalItems: 0,
      estimatedTotal: 0,
    }
  },

  // Create purchase order from template or previous order
  async createFromTemplate(templateOrderId: SelectPurchaseOrder['id'], createdBy: string) {
    if (!Number.isInteger(templateOrderId)) {
      throw new Error('Invalid template order id')
    }

    if (!createdBy?.trim()) {
      throw new Error('Created by is required')
    }

    const templateOrder = await PurchaseOrdersRepository.findById(templateOrderId)
    if (!templateOrder) {
      throw new Error('Template order not found')
    }

    if (!templateOrder.items || templateOrder.items.length === 0) {
      throw new Error('Template order has no items')
    }

    // Create new order based on template
    const newOrderData: CreatePurchaseOrderData = {
      order: {
        supplierId: templateOrder.supplierId,
        createdBy: createdBy.trim(),
        notes: `Created from order ${templateOrder.orderNumber}`,
        subtotal: 0,
        taxAmount: templateOrder.taxAmount,
        discountAmount: templateOrder.discountAmount,
        shippingAmount: templateOrder.shippingAmount,
        total: 0,
      },
      items: templateOrder.items.map(item => ({
        presentationId: item.presentationId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        discount: item.discount,
        discountType: item.discountType,
        notes: item.notes,
      })),
    }

    return this.create(newOrderData)
  },
}
