import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger.js';

interface ComponentOptions {
  name: string;
  type: 'route' | 'controller' | 'service' | 'middleware' | 'model';
  framework: 'express' | 'koa' | 'deno';
  baseDir: string;
  includeTests: boolean;
}

// Templates para cada tipo de componente
const templates = {
  route: `import { Router } from 'express';
import { {{name}}Controller } from '../controllers/{{name}}.js';

const router = Router();
const controller = new {{name}}Controller();

router.get('/{{nameLower}}', controller.get{{name}});
router.post('/{{nameLower}}', controller.create{{name}});
router.put('/{{nameLower}}/:id', controller.update{{name}});
router.delete('/{{nameLower}}/:id', controller.delete{{name}});

export const {{nameLower}}Router = router;`,

  controller: `import { Request, Response, NextFunction } from 'express';
import { {{name}}Service } from '../services/{{name}}.js';

export class {{name}}Controller {
  private service: {{name}}Service;

  constructor() {
    this.service = new {{name}}Service();
  }

  async get{{name}}(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await this.service.getAll();
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  async create{{name}}(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  async update{{name}}(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await this.service.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  }

  async delete{{name}}(req: Request, res: Response, next: NextFunction) {
    try {
      await this.service.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}`,

  service: `export class {{name}}Service {
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
}`,

  model: `import { z } from 'zod';

export const {{name}}Schema = z.object({
  id: z.string().optional(),
  // Adicione mais campos conforme necessário
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type {{name}} = z.infer<typeof {{name}}Schema>;`,

  middleware: `import { Request, Response, NextFunction } from 'express';

export function {{name}}Middleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Implementar lógica do middleware
    next();
  } catch (error) {
    next(error);
  }
}`
};

export async function generateComponent(options: ComponentOptions): Promise<void> {
  const { name, type, baseDir } = options;
  const nameLower = name.toLowerCase();

  try {
    // Criar diretório se não existir
    const componentDir = path.join(baseDir, 'src', `${type}s`);
    await mkdir(componentDir, { recursive: true });

    // Gerar conteúdo do componente
    const template = templates[type];
    const content = template
      .replace(/{{name}}/g, name)
      .replace(/{{nameLower}}/g, nameLower);

    // Salvar arquivo
    await writeFile(
      path.join(componentDir, `${nameLower}.ts`),
      content
    );

    logger.info('Componente %s do tipo %s gerado com sucesso!', name, type);
  } catch (error) {
    logger.error('Erro ao gerar componente %s do tipo %s: %s', name, type, error instanceof Error ? error.message : String(error));
    throw error;
  }
} 