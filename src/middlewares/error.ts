import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Erro na requisição: %s', err instanceof Error ? err.message : String(err));
  res.status(500).json({ error: 'Erro interno do servidor' });
} 