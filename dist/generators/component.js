import { mkdir, writeFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import path from 'path';
function generateRouteTemplate(name, framework) {
    if (framework === 'express') {
        return `import { Router } from 'express';
import { ${name}Controller } from '../controllers/${name}.js';
import { validate${name} } from '../middlewares/validation.js';

const router = Router();
const controller = new ${name}Controller();

router.get('/${name.toLowerCase()}', controller.get${name});
router.post('/${name.toLowerCase()}', validate${name}, controller.create${name});
router.put('/${name.toLowerCase()}/:id', validate${name}, controller.update${name});
router.delete('/${name.toLowerCase()}/:id', controller.delete${name});

export const ${name.toLowerCase()}Router = router;`;
    }
    else if (framework === 'koa') {
        return `import Router from '@koa/router';
import { ${name}Controller } from '../controllers/${name}.js';
import { validate${name} } from '../middlewares/validation.js';

const router = new Router();
const controller = new ${name}Controller();

router.get('/${name.toLowerCase()}', controller.get${name});
router.post('/${name.toLowerCase()}', validate${name}, controller.create${name});
router.put('/${name.toLowerCase()}/:id', validate${name}, controller.update${name});
router.delete('/${name.toLowerCase()}/:id', controller.delete${name});

export const ${name.toLowerCase()}Router = router;`;
    }
    else {
        return `import { Router } from "oak";
import { ${name}Controller } from "../controllers/${name}.ts";
import { validate${name} } from "../middlewares/validation.ts";

const router = new Router();
const controller = new ${name}Controller();

router.get("/${name.toLowerCase()}", controller.get${name});
router.post("/${name.toLowerCase()}", validate${name}, controller.create${name});
router.put("/${name.toLowerCase()}/:id", validate${name}, controller.update${name});
router.delete("/${name.toLowerCase()}/:id", controller.delete${name});

export const ${name.toLowerCase()}Router = router;`;
    }
}
function generateControllerTemplate(name, framework) {
    if (framework === 'express') {
        return `import { Request, Response, NextFunction } from 'express';
import { ${name}Service } from '../services/${name}.js';

export class ${name}Controller {
  private service: ${name}Service;

  constructor() {
    this.service = new ${name}Service();
  }

  async get${name}(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.service.getAll();
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async create${name}(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async update${name}(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async delete${name}(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}`;
    }
    else if (framework === 'koa') {
        return `import { Context } from 'koa';
import { ${name}Service } from '../services/${name}.js';

export class ${name}Controller {
  private service: ${name}Service;

  constructor() {
    this.service = new ${name}Service();
  }

  async get${name}(ctx: Context) {
    try {
      const items = await this.service.getAll();
      ctx.body = items;
    } catch (error) {
      ctx.throw(500, error);
    }
  }

  async create${name}(ctx: Context) {
    try {
      const item = await this.service.create(ctx.request.body);
      ctx.status = 201;
      ctx.body = item;
    } catch (error) {
      ctx.throw(500, error);
    }
  }

  async update${name}(ctx: Context) {
    try {
      const item = await this.service.update(ctx.params.id, ctx.request.body);
      ctx.body = item;
    } catch (error) {
      ctx.throw(500, error);
    }
  }

  async delete${name}(ctx: Context) {
    try {
      await this.service.delete(ctx.params.id);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, error);
    }
  }
}`;
    }
    else {
        return `import { Context } from "oak";
import { ${name}Service } from "../services/${name}.ts";

export class ${name}Controller {
  private service: ${name}Service;

  constructor() {
    this.service = new ${name}Service();
  }

  async get${name}(ctx: Context) {
    try {
      const items = await this.service.getAll();
      ctx.response.body = items;
    } catch (error) {
      throw error;
    }
  }

  async create${name}(ctx: Context) {
    try {
      const body = ctx.request.body();
      const data = await body.value;
      const item = await this.service.create(data);
      ctx.response.status = 201;
      ctx.response.body = item;
    } catch (error) {
      throw error;
    }
  }

  async update${name}(ctx: Context) {
    try {
      const body = ctx.request.body();
      const data = await body.value;
      const item = await this.service.update(ctx.params.id, data);
      ctx.response.body = item;
    } catch (error) {
      throw error;
    }
  }

  async delete${name}(ctx: Context) {
    try {
      await this.service.delete(ctx.params.id);
      ctx.response.status = 204;
    } catch (error) {
      throw error;
    }
  }
}`;
    }
}
function generateServiceTemplate(name) {
    return `export class ${name}Service {
  async getAll() {
    // Implementar lógica de busca
    return [];
  }

  async getById(id: string) {
    // Implementar lógica de busca por ID
    return {};
  }

  async create(data: any) {
    // Implementar lógica de criação
    return { ...data, id: 'new-id' };
  }

  async update(id: string, data: any) {
    // Implementar lógica de atualização
    return { ...data, id };
  }

  async delete(id: string) {
    // Implementar lógica de deleção
    return true;
  }
}`;
}
function generateModelTemplate(name) {
    return `import { z } from 'zod';

export const ${name}Schema = z.object({
  id: z.string().optional(),
  // Adicione mais campos conforme necessário
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ${name} = z.infer<typeof ${name}Schema>;`;
}
function generateMiddlewareTemplate(name, framework) {
    if (framework === 'express') {
        return `import { Request, Response, NextFunction } from 'express';

export function ${name}Middleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Implementar lógica do middleware
    next();
  } catch (error) {
    next(error);
  }
}`;
    }
    else if (framework === 'koa') {
        return `import { Context, Next } from 'koa';

export async function ${name}Middleware(ctx: Context, next: Next) {
  try {
    // Implementar lógica do middleware
    await next();
  } catch (error) {
    throw error;
  }
}`;
    }
    else {
        return `import { Context, Next } from "oak";

export async function ${name}Middleware(ctx: Context, next: Next) {
  try {
    // Implementar lógica do middleware
    await next();
  } catch (error) {
    throw error;
  }
}`;
    }
}
function generateTestTemplate(name, type, framework) {
    const extension = framework === 'deno' ? '.test.ts' : '.test.js';
    const importExt = framework === 'deno' ? '.ts' : '.js';
    return `import { describe, it, expect } from '${framework === 'deno' ? 'testing' : 'jest'}';
${type === 'controller' ? `import { ${name}Controller } from '../controllers/${name}${importExt}';` : ''}
${type === 'service' ? `import { ${name}Service } from '../services/${name}${importExt}';` : ''}
${type === 'middleware' ? `import { ${name}Middleware } from '../middlewares/${name}${importExt}';` : ''}
${type === 'model' ? `import { ${name}Schema } from '../models/${name}${importExt}';` : ''}

describe('${name} ${type}', () => {
  it('should be defined', () => {
    // Implementar testes
    expect(true).toBe(true);
  });
});`;
}
export async function generateComponent(options) {
    const { name, type, framework, baseDir, includeTests } = options;
    // Definir diretório base para o tipo de componente
    const componentDir = path.join(baseDir, 'src', `${type}s`);
    const testsDir = path.join(baseDir, 'src', '__tests__', `${type}s`);
    // Criar diretórios se não existirem
    await mkdir(componentDir, { recursive: true });
    if (includeTests) {
        await mkdir(testsDir, { recursive: true });
    }
    // Gerar conteúdo do componente baseado no tipo
    let content = '';
    const fileExtension = framework === 'deno' ? '.ts' : '.js';
    switch (type) {
        case 'route':
            content = generateRouteTemplate(name, framework);
            break;
        case 'controller':
            content = generateControllerTemplate(name, framework);
            break;
        case 'service':
            content = generateServiceTemplate(name);
            break;
        case 'middleware':
            content = generateMiddlewareTemplate(name, framework);
            break;
        case 'model':
            content = generateModelTemplate(name);
            break;
        default:
            throw new Error(`Tipo de componente '${type}' não suportado`);
    }
    // Escrever arquivo do componente
    const componentPath = path.join(componentDir, `${name}${fileExtension}`);
    await writeFile(componentPath, content, 'utf-8');
    // Gerar arquivo de teste se solicitado
    if (includeTests) {
        const testContent = generateTestTemplate(name, type, framework);
        const testPath = path.join(testsDir, `${name}.test${fileExtension}`);
        await writeFile(testPath, testContent, 'utf-8');
    }
    logger.info(`Componente ${type} '${name}' criado em ${componentPath}`);
    if (includeTests) {
        logger.info(`Testes gerados em ${testsDir}/${name}.test${fileExtension}`);
    }
}
//# sourceMappingURL=component.js.map