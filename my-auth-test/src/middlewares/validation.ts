import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const exampleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

export async function validateExample(req: Request, res: Response, next: NextFunction) {
  try {
    await exampleSchema.parseAsync(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      error: {
        message: 'Dados inválidos',
        details: error?.errors || []
      }
    });
  }
}