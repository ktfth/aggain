import { mkdir, writeFile } from 'fs/promises';

import { capitalize } from '../utils/string.js';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import path from 'path';

export interface SubmoduleOptions {
  moduleName: string;
  submoduleName: string;
  framework: 'koa' | 'express';
  properties: {
    name: string;
    type: string;
    required?: boolean;
  }[];
}

export async function generateSubmodule(options: SubmoduleOptions, projectPath: string): Promise<void> {
  const { moduleName, submoduleName, framework, properties } = options;
  const ModuleName = capitalize(moduleName);
  const SubmoduleName = capitalize(submoduleName);

  try {
    logger.info(`Iniciando geração do submódulo ${submoduleName} para o módulo ${moduleName}`);

    // Verificar se os diretórios base existem
    const srcPath = path.join(projectPath, 'src');
    const modulePath = path.join(srcPath, 'modules', moduleName);
    const submodulePath = path.join(modulePath, submoduleName);

    if (!existsSync(srcPath)) {
      throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
    }

    // Criar estrutura de diretórios
    await mkdir(path.join(srcPath, 'modules'), { recursive: true });
    await mkdir(modulePath, { recursive: true });
    await mkdir(submodulePath, { recursive: true });

    // Criar arquivos do submódulo
    const files = {
      model: path.join(submodulePath, `${submoduleName}.model.ts`),
      controller: path.join(submodulePath, `${submoduleName}.controller.ts`),
      routes: path.join(submodulePath, `${submoduleName}.routes.ts`),
      service: path.join(submodulePath, `${submoduleName}.service.ts`),
      validation: path.join(submodulePath, `${submoduleName}.validation.ts`)
    };

    // Verificar se algum arquivo já existe
    Object.values(files).forEach(file => {
      if (existsSync(file)) {
        throw new Error(`Arquivo ${file} já existe`);
      }
    });

    // Gerar arquivos
    await writeFile(files.model, generateModel(SubmoduleName, properties));
    await writeFile(files.service, generateService(ModuleName, SubmoduleName));
    await writeFile(files.controller, framework === 'koa'
      ? generateKoaController(ModuleName, SubmoduleName)
      : generateExpressController(ModuleName, SubmoduleName));
    await writeFile(files.routes, framework === 'koa'
      ? generateKoaRoutes(ModuleName, SubmoduleName)
      : generateExpressRoutes(ModuleName, SubmoduleName));
    await writeFile(files.validation, generateValidation(SubmoduleName, properties));

    logger.info(`Submódulo ${submoduleName} gerado com sucesso em ${submodulePath}`);
  } catch (error) {
    logger.error('Erro ao gerar submódulo:', error);
    throw error;
  }
}

function generateModel(SubmoduleName: string, properties: SubmoduleOptions['properties']): string {
  const schemaProperties = properties
    .map(prop => `  ${prop.name}: {
    type: ${prop.type},
    required: ${prop.required ?? false}
  }`)
    .join(',\n');

  return `import mongoose from 'mongoose';

const ${SubmoduleName.toLowerCase()}Schema = new mongoose.Schema({
${schemaProperties}
}, {
  timestamps: true
});

export const ${SubmoduleName}Model = mongoose.model('${SubmoduleName}', ${SubmoduleName.toLowerCase()}Schema);`;
}

function generateService(ModuleName: string, SubmoduleName: string): string {
  return `import { ${SubmoduleName}Model } from './${SubmoduleName.toLowerCase()}.model.js';
import { logger } from '../../../utils/logger.js';

export class ${SubmoduleName}Service {
  static async create(data: any) {
    try {
      return await ${SubmoduleName}Model.create(data);
    } catch (error) {
      logger.error('Erro ao criar ${SubmoduleName}:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      return await ${SubmoduleName}Model.find();
    } catch (error) {
      logger.error('Erro ao buscar ${SubmoduleName}s:', error);
      throw error;
    }
  }

  static async findById(id: string) {
    try {
      return await ${SubmoduleName}Model.findById(id);
    } catch (error) {
      logger.error('Erro ao buscar ${SubmoduleName}:', error);
      throw error;
    }
  }

  static async update(id: string, data: any) {
    try {
      return await ${SubmoduleName}Model.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      logger.error('Erro ao atualizar ${SubmoduleName}:', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      return await ${SubmoduleName}Model.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Erro ao deletar ${SubmoduleName}:', error);
      throw error;
    }
  }
}`;
}

function generateKoaController(ModuleName: string, SubmoduleName: string): string {
  return `import { Context } from 'koa';
import { ${SubmoduleName}Service } from './${SubmoduleName.toLowerCase()}.service.js';
import { validate${SubmoduleName} } from './${SubmoduleName.toLowerCase()}.validation.js';
import { logger } from '../../../utils/logger.js';

type ErrorWithStatus = {
  status?: number;
  message?: string;
};

function handleError(err: unknown): ErrorWithStatus {
  logger.error('Erro no controller ${SubmoduleName}:', err);
  
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

export class ${SubmoduleName}Controller {
  static async create(ctx: Context) {
    try {
      const data = ctx.request.body;
      await validate${SubmoduleName}(data);
      const result = await ${SubmoduleName}Service.create(data);
      logger.info('${SubmoduleName} criado com sucesso:', result);
      ctx.status = 201;
      ctx.body = result;
    } catch (err) {
      const error = handleError(err);
      ctx.status = error.status || 400;
      ctx.body = { 
        error: error.message || 'Erro ao criar ${SubmoduleName}' 
      };
    }
  }

  static async getAll(ctx: Context) {
    try {
      const results = await ${SubmoduleName}Service.findAll();
      logger.info('${SubmoduleName}s listados com sucesso');
      ctx.body = results;
    } catch (err) {
      const error = handleError(err);
      ctx.status = error.status || 500;
      ctx.body = { 
        error: error.message || 'Erro ao buscar ${SubmoduleName}s' 
      };
    }
  }

  static async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const result = await ${SubmoduleName}Service.findById(id);
      if (!result) {
        logger.warn('${SubmoduleName} não encontrado:', id);
        ctx.status = 404;
        ctx.body = { error: '${SubmoduleName} não encontrado' };
        return;
      }
      logger.info('${SubmoduleName} encontrado:', result);
      ctx.body = result;
    } catch (err) {
      const error = handleError(err);
      ctx.status = error.status || 500;
      ctx.body = { 
        error: error.message || 'Erro ao buscar ${SubmoduleName}' 
      };
    }
  }

  static async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const data = ctx.request.body;
      await validate${SubmoduleName}(data);
      const result = await ${SubmoduleName}Service.update(id, data);
      if (!result) {
        logger.warn('${SubmoduleName} não encontrado para atualização:', id);
        ctx.status = 404;
        ctx.body = { error: '${SubmoduleName} não encontrado' };
        return;
      }
      logger.info('${SubmoduleName} atualizado com sucesso:', result);
      ctx.body = result;
    } catch (err) {
      const error = handleError(err);
      ctx.status = error.status || 500;
      ctx.body = { 
        error: error.message || 'Erro ao atualizar ${SubmoduleName}' 
      };
    }
  }

  static async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const result = await ${SubmoduleName}Service.delete(id);
      if (!result) {
        logger.warn('${SubmoduleName} não encontrado para exclusão:', id);
        ctx.status = 404;
        ctx.body = { error: '${SubmoduleName} não encontrado' };
        return;
      }
      logger.info('${SubmoduleName} excluído com sucesso:', id);
      ctx.status = 204;
    } catch (err) {
      const error = handleError(err);
      ctx.status = error.status || 500;
      ctx.body = { 
        error: error.message || 'Erro ao deletar ${SubmoduleName}' 
      };
    }
  }
}`;
}

function generateExpressController(ModuleName: string, SubmoduleName: string): string {
  return `import { Request, Response } from 'express';
import { ${SubmoduleName}Service } from './${SubmoduleName.toLowerCase()}.service.js';
import { validate${SubmoduleName} } from './${SubmoduleName.toLowerCase()}.validation.js';
import { logger } from '../../../utils/logger.js';

type ErrorWithStatus = {
  status?: number;
  message?: string;
};

function handleError(err: unknown): ErrorWithStatus {
  logger.error('Erro no controller ${SubmoduleName}:', err);
  
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

export class ${SubmoduleName}Controller {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body;
      await validate${SubmoduleName}(data);
      const result = await ${SubmoduleName}Service.create(data);
      logger.info('${SubmoduleName} criado com sucesso:', result);
      res.status(201).json(result);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 400).json({ 
        error: error.message || 'Erro ao criar ${SubmoduleName}' 
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const results = await ${SubmoduleName}Service.findAll();
      logger.info('${SubmoduleName}s listados com sucesso');
      res.json(results);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao buscar ${SubmoduleName}s' 
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ${SubmoduleName}Service.findById(id);
      if (!result) {
        logger.warn('${SubmoduleName} não encontrado:', id);
        return res.status(404).json({ error: '${SubmoduleName} não encontrado' });
      }
      logger.info('${SubmoduleName} encontrado:', result);
      res.json(result);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao buscar ${SubmoduleName}' 
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      await validate${SubmoduleName}(data);
      const result = await ${SubmoduleName}Service.update(id, data);
      if (!result) {
        logger.warn('${SubmoduleName} não encontrado para atualização:', id);
        return res.status(404).json({ error: '${SubmoduleName} não encontrado' });
      }
      logger.info('${SubmoduleName} atualizado com sucesso:', result);
      res.json(result);
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao atualizar ${SubmoduleName}' 
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ${SubmoduleName}Service.delete(id);
      if (!result) {
        logger.warn('${SubmoduleName} não encontrado para exclusão:', id);
        return res.status(404).json({ error: '${SubmoduleName} não encontrado' });
      }
      logger.info('${SubmoduleName} excluído com sucesso:', id);
      res.status(204).send();
    } catch (err) {
      const error = handleError(err);
      res.status(error.status || 500).json({ 
        error: error.message || 'Erro ao deletar ${SubmoduleName}' 
      });
    }
  }
}`;
}

function generateExpressRoutes(ModuleName: string, SubmoduleName: string): string {
  return `import express from 'express';
import { ${SubmoduleName}Controller } from './${SubmoduleName.toLowerCase()}.controller.js';
import { logger } from '../../../utils/logger.js';

const router = express.Router();

// Middleware para tratamento de erros
const errorHandler = (fn: Function) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    logger.error('Erro na rota ${SubmoduleName}:', error);
    next(error);
  }
};

router.post('/api/${ModuleName.toLowerCase()}/${SubmoduleName.toLowerCase()}', errorHandler(${SubmoduleName}Controller.create));
router.get('/api/${ModuleName.toLowerCase()}/${SubmoduleName.toLowerCase()}', errorHandler(${SubmoduleName}Controller.getAll));
router.get('/api/${ModuleName.toLowerCase()}/${SubmoduleName.toLowerCase()}/:id', errorHandler(${SubmoduleName}Controller.getById));
router.put('/api/${ModuleName.toLowerCase()}/${SubmoduleName.toLowerCase()}/:id', errorHandler(${SubmoduleName}Controller.update));
router.delete('/api/${ModuleName.toLowerCase()}/${SubmoduleName.toLowerCase()}/:id', errorHandler(${SubmoduleName}Controller.delete));

export default router;`;
}

function generateKoaRoutes(ModuleName: string, SubmoduleName: string): string {
  return `import Router from '@koa/router';
import { ${SubmoduleName}Controller } from './${SubmoduleName.toLowerCase()}.controller.js';
import { logger } from '../../../utils/logger.js';

const router = new Router({
  prefix: '/api/${ModuleName.toLowerCase()}/${SubmoduleName.toLowerCase()}'
});

// Middleware para tratamento de erros
const errorHandler = (fn: Function) => async (ctx: Router.RouterContext, next: Router.Next) => {
  try {
    await fn(ctx, next);
  } catch (error) {
    logger.error('Erro na rota ${SubmoduleName}:', error);
    throw error;
  }
};

router.post('/', errorHandler(${SubmoduleName}Controller.create));
router.get('/', errorHandler(${SubmoduleName}Controller.getAll));
router.get('/:id', errorHandler(${SubmoduleName}Controller.getById));
router.put('/:id', errorHandler(${SubmoduleName}Controller.update));
router.delete('/:id', errorHandler(${SubmoduleName}Controller.delete));

export default router;`;
}

function generateValidation(SubmoduleName: string, properties: SubmoduleOptions['properties']): string {
  const validationRules = properties
    .map(prop => {
      if (prop.required) {
        return `  if (!data.${prop.name}) {
    throw { status: 400, message: '${prop.name} é obrigatório' };
  }`;
      }
      return '';
    })
    .filter(rule => rule !== '')
    .join('\n');

  return `export async function validate${SubmoduleName}(data: any) {
  if (!data) {
    throw { status: 400, message: 'Dados não fornecidos' };
  }

${validationRules}

  return true;
}`;
} 