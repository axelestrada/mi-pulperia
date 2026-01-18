import log from 'electron-log'

log.initialize()

const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
}

function forward(
  level: 'log' | 'info' | 'warn' | 'error',
  args: unknown[]
) {
  originalConsole[level](...args)
  log[level](...args)
}

console.log = (...args) => forward('log', args)
console.info = (...args) => forward('info', args)
console.warn = (...args) => forward('warn', args)
console.error = (...args) => forward('error', args)

process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
})

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason)
})

export { log }
