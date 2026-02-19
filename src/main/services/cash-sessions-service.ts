import {
  InsertCashSession,
  type SelectCashSession,
} from '../db/schema/cash-sessions'
import { CashRegistersRepository } from '../repositories/cash-registers-repository'
import {
  type CashSessionsFilters,
  CashSessionsRepository,
} from '../repositories/cash-sessions-repository'
import { SalesRepository } from '../repositories/sales-repository'

export const CashSessionsService = {
  async list(filters: CashSessionsFilters = {}) {
    return CashSessionsRepository.findAll(filters)
  },

  async getById(id: SelectCashSession['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash session id')
    }

    const session = await CashSessionsRepository.findById(id)
    if (!session) {
      throw new Error('Cash session not found')
    }

    return session
  },

  async openSession(input: {
    cashRegisterId: number
    openedBy: string
    openingAmount: number
    notes?: string
  }) {
    // Validate required fields
    if (!Number.isInteger(input.cashRegisterId)) {
      throw new Error('Invalid cash register id')
    }

    if (!input.openedBy?.trim()) {
      throw new Error('User who opens the session is required')
    }

    if (input.openingAmount < 0) {
      throw new Error('Opening amount cannot be negative')
    }

    // Check if cash register exists and is active
    const cashRegister = await CashRegistersRepository.findById(
      input.cashRegisterId
    )
    if (!cashRegister) {
      throw new Error('Cash register not found')
    }

    if (!cashRegister.isActive) {
      throw new Error('Cannot open session on inactive cash register')
    }

    // Check if there's already an open session for this cash register
    const existingSession = await CashSessionsRepository.findOpenSession(
      input.cashRegisterId
    )
    if (existingSession) {
      throw new Error('There is already an open session for this cash register')
    }

    return CashSessionsRepository.create({
      cashRegisterId: input.cashRegisterId,
      openedBy: input.openedBy.trim(),
      openingAmount: input.openingAmount,
      notes: input.notes?.trim() || undefined,
      status: 'open',
    })
  },

  async closeSession(
    id: SelectCashSession['id'],
    input: {
      closedBy: string
      actualAmount: number
      notes?: string
    }
  ) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash session id')
    }

    if (!input.closedBy?.trim()) {
      throw new Error('User who closes the session is required')
    }

    if (input.actualAmount < 0) {
      throw new Error('Actual amount cannot be negative')
    }

    // Check if session exists and is open
    const session = await CashSessionsRepository.findById(id)
    if (!session) {
      throw new Error('Cash session not found')
    }

    if (session.status !== 'open') {
      throw new Error('Session is already closed')
    }

    // Calculate expected amount based on sales
    const salesSummary = await SalesRepository.getSalesForSession(id)
    const expectedAmount =
      session.openingAmount + (salesSummary.summary?.totalAmount || 0)

    return CashSessionsRepository.close(
      id,
      input.closedBy.trim(),
      input.actualAmount,
      expectedAmount,
      input.notes?.trim()
    )
  },

  async getCurrentOpenSession() {
    return CashSessionsRepository.findAnyOpenSession()
  },

  async getOpenSessionForRegister(cashRegisterId: number) {
    if (!Number.isInteger(cashRegisterId)) {
      throw new Error('Invalid cash register id')
    }

    return CashSessionsRepository.findOpenSession(cashRegisterId)
  },

  async getSessionSummary(id: SelectCashSession['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash session id')
    }

    const session = await CashSessionsRepository.findById(id)
    if (!session) {
      throw new Error('Cash session not found')
    }

    // Get sales summary for this session
    const salesData = await SalesRepository.getSalesForSession(id)

    return {
      session,
      salesSummary: salesData.summary,
      paymentBreakdown: salesData.paymentBreakdown,
    }
  },

  async updateSessionNotes(id: SelectCashSession['id'], notes: string) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid cash session id')
    }

    const session = await CashSessionsRepository.findById(id)
    if (!session) {
      throw new Error('Cash session not found')
    }

    return CashSessionsRepository.update(id, {
      notes: notes?.trim() || undefined,
    })
  },

  async validateCanMakeSale() {
    const openSession = await CashSessionsRepository.findAnyOpenSession()

    if (!openSession) {
      throw new Error(
        'No hay una caja abierta. Por favor, abre una sesión de caja antes de realizar una venta.'
      )
    }

    return openSession
  },

  // Get sessions that need to be closed (open for more than 24 hours)
  async getSessionsNeedingClosure() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    return CashSessionsRepository.findAll({
      status: 'open',
      dateTo: twentyFourHoursAgo,
      sortBy: 'openedAt',
      sortOrder: 'asc',
    })
  },

  // Get session statistics
  async getSessionStats(filters: { dateFrom?: Date; dateTo?: Date } = {}) {
    const sessionsData = await CashSessionsRepository.findAll({
      status: 'closed',
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      limit: 1000, // Get more records for stats
    })

    const sessions = sessionsData.data

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        totalDifference: 0,
        averageDifference: 0,
        sessionsWithShortages: 0,
        sessionsWithOverages: 0,
      }
    }

    const totalSessions = sessions.length
    const totalDifference = sessions.reduce(
      (sum, session) => sum + (session.difference || 0),
      0
    )
    const averageDifference = totalDifference / totalSessions

    const sessionsWithShortages = sessions.filter(
      session => (session.difference || 0) < 0
    ).length
    const sessionsWithOverages = sessions.filter(
      session => (session.difference || 0) > 0
    ).length

    // Calculate average session duration
    const durations = sessions
      .filter(session => session.closedAt && session.openedAt)
      .map(session => {
        const opened = new Date(session.openedAt!)
        const closed = new Date(session.closedAt!)
        return closed.getTime() - opened.getTime()
      })

    const averageSessionDuration =
      durations.length > 0
        ? durations.reduce((sum, duration) => sum + duration, 0) /
          durations.length
        : 0

    return {
      totalSessions,
      averageSessionDuration: Math.round(averageSessionDuration / (1000 * 60)), // Convert to minutes
      totalDifference,
      averageDifference: Math.round(averageDifference * 100) / 100, // Round to 2 decimal places
      sessionsWithShortages,
      sessionsWithOverages,
    }
  },
}
