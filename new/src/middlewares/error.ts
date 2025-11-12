import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error({ err }, 'Erro na requisição');
  res.status(500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status: 500
    }
  });
}