function generateLogger(): string {
  return `import pino from 'pino';

// Criar uma única instância do logger
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'dd/mm/yyyy HH:MM:ss',
      ignore: 'pid,hostname',
      singleLine: true,
      messageFormat: '{msg}'
    }
  },
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  base: null
});

// Cache para evitar logs duplicados
const logCache = new Map<string, NodeJS.Timeout>();

// Wrapper para evitar duplicação
const wrappedLogger = {
  info: (message: string, ...args: any[]) => {
    const key = \`\${message}\${JSON.stringify(args)}\`;
    if (!logCache.has(key)) {
      const timeout = setTimeout(() => logCache.delete(key), 100);
      logCache.set(key, timeout);
      logger.info(message, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    const key = \`\${message}\${JSON.stringify(args)}\`;
    if (!logCache.has(key)) {
      const timeout = setTimeout(() => logCache.delete(key), 100);
      logCache.set(key, timeout);
      logger.warn(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    const key = \`\${message}\${JSON.stringify(args)}\`;
    if (!logCache.has(key)) {
      const timeout = setTimeout(() => logCache.delete(key), 100);
      logCache.set(key, timeout);
      logger.error(message, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    const key = \`\${message}\${JSON.stringify(args)}\`;
    if (!logCache.has(key)) {
      const timeout = setTimeout(() => logCache.delete(key), 100);
      logCache.set(key, timeout);
      logger.debug(message, ...args);
    }
  }
};

// Exportar a instância única
export { wrappedLogger as logger };

// Garantir que apenas uma instância seja criada
Object.freeze(wrappedLogger);

// Adicionar handlers para erros não tratados
process.on('uncaughtException', (error: Error) => {
  wrappedLogger.error('Erro não tratado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  wrappedLogger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});`;
} 