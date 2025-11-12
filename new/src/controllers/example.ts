import { Request, Response, NextFunction } from 'express';

export class ExampleController {
  async getExample(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ message: 'Exemplo de resposta GET' });
    } catch (error) {
      next(error);
    }
  }

  async createExample(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      res.status(201).json({ 
        message: 'Exemplo de resposta POST',
        data 
      });
    } catch (error) {
      next(error);
    }
  }
}