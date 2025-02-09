import winston from 'winston';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

const customFormat = printf((info) => {
  return `${info.timestamp} [${info.level}]: ${info.message}`;
});

export const logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),
    new transports.File({
      filename: 'error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),
  ],
});

// Adicionar handlers para erros não tratados
process.on('uncaughtException', (error: Error) => {
  logger.error('Erro não tratado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
}); 