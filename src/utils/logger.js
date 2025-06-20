const { createLogger, format, transports } = require('winston')
const path = require('path')

function simpleLogFormat({ colorize = false } = {}) {
  return format.printf((info) => {
    const level = info.level.toUpperCase().padEnd(5, ' ')
    const levelDisplay = colorize
      ? format.colorize().colorize(info.level, level)
      : level
    const stack = info.stack ? `\n${info.stack}` : ''
    let meta = ''
    if (info.meta && Object.keys(info.meta).length > 0) {
      meta = ` :: ${JSON.stringify(info.meta)}`
    }
    return `${info.timestamp} [${levelDisplay}] ${info.message}${meta}${stack}`
  })
}

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    // Console output (colorized for dev - Simple..)
    new transports.Console({
      format: format.combine(
        format.timestamp({ format: 'YY-MM-DD HH:mm:ss.SSS' }),
        simpleLogFormat({ colorize: true })
      )
    }),

    // // File output
    // new transports.File({ 
    //   filename: path.join(__dirname, '../../logs/error.log'), 
    //   level: 'error' 
    // }),
    // new transports.File({ 
    //   filename: path.join(__dirname, '../../logs/app.log') 
    // }),

    // Will remove in Production (for My Ease)
    new transports.File({
      filename: path.join(__dirname, "../../logs/readableLogs.log"),
      format: format.combine(
        format.timestamp({ format: 'YY-MM-DD HH:mm:ss.SSS' }),
        simpleLogFormat({ colorize: false })
      )
    })
  ],
  exitOnError: false,
})

module.exports = logger