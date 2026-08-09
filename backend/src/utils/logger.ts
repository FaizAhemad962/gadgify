import winston from 'winston'
import path from 'path'
import fs from 'fs'

const isServerless = process.env.VERCEL === '1'
const isProduction = process.env.NODE_ENV === 'production'
const transports: winston.transport[] = []

if (!isServerless) {
  // Local/server deployments can write log files. Vercel functions cannot write
  // to the bundled app directory, so they must log to stdout/stderr instead.
  const logsDir = path.join(__dirname, '../../logs')
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true })
  }

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  )
}

if (isServerless || !isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        isProduction ? winston.format.uncolorize() : winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
})

export default logger
