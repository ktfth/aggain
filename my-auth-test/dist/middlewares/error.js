import { logger } from '../utils/logger.js';
export function errorHandler(err, req, res, next) {
    logger.error({ err }, 'Erro na requisição');
    res.status(500).json({
        error: {
            message: err.message || 'Erro interno do servidor',
            status: 500
        }
    });
}
//# sourceMappingURL=error.js.map