import { capitalize } from '../utils/string.js';

export interface CrudOptions {
  entityName: string;
  properties: {
    name: string;
    type: string;
    required?: boolean;
  }[];
}

export function generateKoaController(options: CrudOptions): string {
  const { entityName } = options;
  const EntityName = capitalize(entityName);
  
  return `import { Context } from 'koa';
import { ${EntityName}Model } from '../models/${entityName}.model.js';
import { logger } from '../utils/logger.js';

export class ${EntityName}Controller {
  static async create(ctx: Context) {
    try {
      const data = ctx.request.body;
      const ${entityName} = await ${EntityName}Model.create(data);
      ctx.status = 201;
      ctx.body = ${entityName};
    } catch (error) {
      logger.error('Erro ao criar ${entityName}:', error);
      ctx.throw(400, 'Erro ao criar ${entityName}');
    }
  }

  static async getAll(ctx: Context) {
    try {
      const ${entityName}s = await ${EntityName}Model.find();
      ctx.body = ${entityName}s;
    } catch (error) {
      logger.error('Erro ao buscar ${entityName}s:', error);
      ctx.throw(500, 'Erro ao buscar ${entityName}s');
    }
  }

  static async getById(ctx: Context) {
    try {
      const { id } = ctx.params;
      const ${entityName} = await ${EntityName}Model.findById(id);
      if (!${entityName}) {
        ctx.throw(404, '${EntityName} não encontrado');
      }
      ctx.body = ${entityName};
    } catch (error) {
      logger.error('Erro ao buscar ${entityName}:', error);
      ctx.throw(500, 'Erro ao buscar ${entityName}');
    }
  }

  static async update(ctx: Context) {
    try {
      const { id } = ctx.params;
      const data = ctx.request.body;
      const ${entityName} = await ${EntityName}Model.findByIdAndUpdate(id, data, { new: true });
      if (!${entityName}) {
        ctx.throw(404, '${EntityName} não encontrado');
      }
      ctx.body = ${entityName};
    } catch (error) {
      logger.error('Erro ao atualizar ${entityName}:', error);
      ctx.throw(500, 'Erro ao atualizar ${entityName}');
    }
  }

  static async delete(ctx: Context) {
    try {
      const { id } = ctx.params;
      const ${entityName} = await ${EntityName}Model.findByIdAndDelete(id);
      if (!${entityName}) {
        ctx.throw(404, '${EntityName} não encontrado');
      }
      ctx.status = 204;
    } catch (error) {
      logger.error('Erro ao deletar ${entityName}:', error);
      ctx.throw(500, 'Erro ao deletar ${entityName}');
    }
  }
}`;
}

export function generateExpressController(options: CrudOptions): string {
  const { entityName } = options;
  const EntityName = capitalize(entityName);
  
  return `import { Request, Response } from 'express';
import { ${EntityName}Model } from '../models/${entityName}.model.js';
import { logger } from '../utils/logger.js';

export class ${EntityName}Controller {
  static async create(req: Request, res: Response) {
    try {
      const data = req.body;
      const ${entityName} = await ${EntityName}Model.create(data);
      res.status(201).json(${entityName});
    } catch (error) {
      logger.error('Erro ao criar ${entityName}:', error);
      res.status(400).json({ error: 'Erro ao criar ${entityName}' });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const ${entityName}s = await ${EntityName}Model.find();
      res.json(${entityName}s);
    } catch (error) {
      logger.error('Erro ao buscar ${entityName}s:', error);
      res.status(500).json({ error: 'Erro ao buscar ${entityName}s' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ${entityName} = await ${EntityName}Model.findById(id);
      if (!${entityName}) {
        return res.status(404).json({ error: '${EntityName} não encontrado' });
      }
      res.json(${entityName});
    } catch (error) {
      logger.error('Erro ao buscar ${entityName}:', error);
      res.status(500).json({ error: 'Erro ao buscar ${entityName}' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const ${entityName} = await ${EntityName}Model.findByIdAndUpdate(id, data, { new: true });
      if (!${entityName}) {
        return res.status(404).json({ error: '${EntityName} não encontrado' });
      }
      res.json(${entityName});
    } catch (error) {
      logger.error('Erro ao atualizar ${entityName}:', error);
      res.status(500).json({ error: 'Erro ao atualizar ${entityName}' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ${entityName} = await ${EntityName}Model.findByIdAndDelete(id);
      if (!${entityName}) {
        return res.status(404).json({ error: '${EntityName} não encontrado' });
      }
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar ${entityName}:', error);
      res.status(500).json({ error: 'Erro ao deletar ${entityName}' });
    }
  }
}`;
}

export function generateModel(options: CrudOptions): string {
  const { entityName, properties } = options;
  const EntityName = capitalize(entityName);
  
  const schemaProperties = properties
    .map(prop => `  ${prop.name}: {
    type: ${prop.type},
    required: ${prop.required ?? false}
  }`)
    .join(',\n');

  return `import mongoose from 'mongoose';

const ${entityName}Schema = new mongoose.Schema({
${schemaProperties}
}, {
  timestamps: true
});

export const ${EntityName}Model = mongoose.model('${EntityName}', ${entityName}Schema);`;
}

export function generateKoaRoutes(options: CrudOptions): string {
  const { entityName } = options;
  const EntityName = capitalize(entityName);

  return `import Router from '@koa/router';
import { ${EntityName}Controller } from '../controllers/${entityName}.controller.js';

const router = new Router({
  prefix: '/${entityName}s'
});

router.post('/', ${EntityName}Controller.create);
router.get('/', ${EntityName}Controller.getAll);
router.get('/:id', ${EntityName}Controller.getById);
router.put('/:id', ${EntityName}Controller.update);
router.delete('/:id', ${EntityName}Controller.delete);

export default router;`;
}

export function generateExpressRoutes(options: CrudOptions): string {
  const { entityName } = options;
  const EntityName = capitalize(entityName);

  return `import express from 'express';
import { ${EntityName}Controller } from '../controllers/${entityName}.controller.js';

const router = express.Router();

router.post('/${entityName}s', ${EntityName}Controller.create);
router.get('/${entityName}s', ${EntityName}Controller.getAll);
router.get('/${entityName}s/:id', ${EntityName}Controller.getById);
router.put('/${entityName}s/:id', ${EntityName}Controller.update);
router.delete('/${entityName}s/:id', ${EntityName}Controller.delete);

export default router;`;
} 