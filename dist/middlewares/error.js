import { logger } from '../utils/logger.js';
export function errorHandler(err, req, res, next) {
    logger.error('Erro na requisição: %s', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Erro interno do servidor' });
}
//# sourceMappingURL=error.js.map