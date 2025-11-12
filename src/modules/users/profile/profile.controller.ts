import { Request, Response } from 'express';
import { ProfileService } from './profile.service.js';
import { validateProfile } from './profile.validation.js';

type ErrorWithStatus = {
  status?: number;
  message?: string;
};

function handleError(err: unknown): ErrorWithStatus {
  if (err instanceof Error) {
    return {
      status: (err as ErrorWithStatus).status || 500,
      message: err.message
    };
  }
  return {
    status: 500,
    message: 'Erro interno do servidor'
  };
}

export class ProfileController {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body;
      await validateProfile(data);
      const result = await ProfileService.create(data);
      res.status(201).json(result);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 400).json({ 
        error: error.message || 'Erro ao criar Profile' 
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const results = await ProfileService.findAll();
      res.json(results);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao buscar Profiles' 
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProfileService.findById(id);
      if (!result) {
        return res.status(404).json({ error: 'Profile não encontrado' });
      }
      res.json(result);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao buscar Profile' 
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      await validateProfile(data);
      const result = await ProfileService.update(id, data);
      if (!result) {
        return res.status(404).json({ error: 'Profile não encontrado' });
      }
      res.json(result);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao atualizar Profile' 
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ProfileService.delete(id);
      if (!result) {
        return res.status(404).json({ error: 'Profile não encontrado' });
      }
      res.status(204).send();
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao deletar Profile' 
      });
    }
  }
}