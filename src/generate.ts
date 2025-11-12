import { mkdir, writeFile, readFile, access } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { logger } from './utils/logger.js';
import { constants } from 'fs';

export interface GenerateOptions {
  type: 'route' | 'controller' | 'model' | 'service' | 'middleware' | 'test';
  name: string;
  path?: string;
  framework?: 'express' | 'koa';
}

/**
 * Detecta o framework do projeto analisando os arquivos
 */
async function detectFramework(projectPath: string): Promise<'express' | 'koa' | null> {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    if (packageJson.dependencies?.express) return 'express';
    if (packageJson.dependencies?.koa) return 'koa';

    return null;
  } catch {
    return null;
  }
}

/**
 * Detecta se o projeto está usando TypeScript
 */
async function detectTypeScript(projectPath: string): Promise<boolean> {
  try {
    // Verifica se existe tsconfig.json
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    try {
      await access(tsconfigPath, constants.F_OK);
      return true;
    } catch {}

    // Verifica se TypeScript está nas dependências
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

    if (packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Verifica se o diretório é um projeto aggain
 */
async function isAggainProject(projectPath: string): Promise<boolean> {
  try {
    const srcPath = path.join(projectPath, 'src');
    await access(srcPath, constants.F_OK);

    const packageJsonPath = path.join(projectPath, 'package.json');
    await access(packageJsonPath, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}

/**
 * Converte nome em PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converte nome em camelCase
 */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converte nome em kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// ==================== TEMPLATES ====================

function generateRouteTemplate(name: string, framework: 'express' | 'koa', useJsExtension: boolean = true): string {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = toKebabCase(name);
  const ext = useJsExtension ? '.js' : '';

  if (framework === 'express') {
    return `import { Router } from 'express';
import { ${camelName}Controller } from '../controllers/${kebabName}.controller${ext}';

const router = Router();

/**
 * @swagger
 * /api/${kebabName}:
 *   get:
 *     summary: Lista todos os ${name}
 *     tags: [${pascalName}]
 *     responses:
 *       200:
 *         description: Lista de ${name}
 */
router.get('/', ${camelName}Controller.getAll);

/**
 * @swagger
 * /api/${kebabName}/{id}:
 *   get:
 *     summary: Busca ${name} por ID
 *     tags: [${pascalName}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${pascalName} encontrado
 *       404:
 *         description: ${pascalName} não encontrado
 */
router.get('/:id', ${camelName}Controller.getById);

/**
 * @swagger
 * /api/${kebabName}:
 *   post:
 *     summary: Cria um novo ${name}
 *     tags: [${pascalName}]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: ${pascalName} criado com sucesso
 */
router.post('/', ${camelName}Controller.create);

/**
 * @swagger
 * /api/${kebabName}/{id}:
 *   put:
 *     summary: Atualiza um ${name}
 *     tags: [${pascalName}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${pascalName} atualizado
 *       404:
 *         description: ${pascalName} não encontrado
 */
router.put('/:id', ${camelName}Controller.update);

/**
 * @swagger
 * /api/${kebabName}/{id}:
 *   delete:
 *     summary: Remove um ${name}
 *     tags: [${pascalName}]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ${pascalName} removido
 *       404:
 *         description: ${pascalName} não encontrado
 */
router.delete('/:id', ${camelName}Controller.remove);

export default router;
`;
  } else {
    // Koa
    return `import Router from '@koa/router';
import { ${camelName}Controller } from '../controllers/${kebabName}.controller${ext}';

const router = new Router({
  prefix: '/api/${kebabName}'
});

router.get('/', ${camelName}Controller.getAll);
router.get('/:id', ${camelName}Controller.getById);
router.post('/', ${camelName}Controller.create);
router.put('/:id', ${camelName}Controller.update);
router.delete('/:id', ${camelName}Controller.remove);

export default router;
`;
  }
}

function generateControllerTemplate(name: string, framework: 'express' | 'koa', useJsExtension: boolean = true): string {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = toKebabCase(name);
  const ext = useJsExtension ? '.js' : '';

  if (framework === 'express') {
    return `import { Request, Response, NextFunction } from 'express';
import { ${camelName}Service } from '../services/${kebabName}.service${ext}';
import { AppError } from '../utils/errors${ext}';

class ${pascalName}Controller {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ${camelName}Service.findAll();
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await ${camelName}Service.findById(id);

      if (!item) {
        throw new AppError('${pascalName} não encontrado', 404);
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const item = await ${camelName}Service.create(data);

      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;
      const item = await ${camelName}Service.update(id, data);

      if (!item) {
        throw new AppError('${pascalName} não encontrado', 404);
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ${camelName}Service.remove(id);

      res.json({
        success: true,
        message: '${pascalName} removido com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ${camelName}Controller = new ${pascalName}Controller();
`;
  } else {
    // Koa
    return `import { Context } from 'koa';
import { ${camelName}Service } from '../services/${kebabName}.service${ext}';

class ${pascalName}Controller {
  async getAll(ctx: Context) {
    const items = await ${camelName}Service.findAll();
    ctx.body = {
      success: true,
      data: items
    };
  }

  async getById(ctx: Context) {
    const { id } = ctx.params;
    const item = await ${camelName}Service.findById(id);

    if (!item) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '${pascalName} não encontrado'
      };
      return;
    }

    ctx.body = {
      success: true,
      data: item
    };
  }

  async create(ctx: Context) {
    const data = ctx.request.body;
    const item = await ${camelName}Service.create(data);

    ctx.status = 201;
    ctx.body = {
      success: true,
      data: item
    };
  }

  async update(ctx: Context) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const item = await ${camelName}Service.update(id, data);

    if (!item) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '${pascalName} não encontrado'
      };
      return;
    }

    ctx.body = {
      success: true,
      data: item
    };
  }

  async remove(ctx: Context) {
    const { id } = ctx.params;
    await ${camelName}Service.remove(id);

    ctx.body = {
      success: true,
      message: '${pascalName} removido com sucesso'
    };
  }
}

export const ${camelName}Controller = new ${pascalName}Controller();
`;
  }
}

function generateServiceTemplate(name: string, useJsExtension: boolean = true): string {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const kebabName = toKebabCase(name);
  const ext = useJsExtension ? '.js' : '';

  return `import { ${pascalName} } from '../models/${kebabName}.model${ext}';

class ${pascalName}Service {
  async findAll() {
    // TODO: Implementar lógica de busca
    return [];
  }

  async findById(id: string) {
    // TODO: Implementar lógica de busca por ID
    return null;
  }

  async create(data: any) {
    // TODO: Implementar lógica de criação
    return data;
  }

  async update(id: string, data: any) {
    // TODO: Implementar lógica de atualização
    return { id, ...data };
  }

  async remove(id: string) {
    // TODO: Implementar lógica de remoção
    return true;
  }
}

export const ${camelName}Service = new ${pascalName}Service();
`;
}

function generateModelTemplate(name: string): string {
  const pascalName = toPascalCase(name);

  return `export interface ${pascalName} {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // TODO: Adicionar campos do modelo
}

// TODO: Se estiver usando MongoDB/Mongoose, adicionar schema
// TODO: Se estiver usando TypeORM, adicionar decorators
`;
}

function generateMiddlewareTemplate(name: string, framework: 'express' | 'koa', useJsExtension: boolean = true): string {
  const pascalName = toPascalCase(name);
  const camelName = toCamelCase(name);
  const ext = useJsExtension ? '.js' : '';

  if (framework === 'express') {
    return `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger${ext}';

export async function ${camelName}(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info('Middleware ${pascalName} executado');
    // TODO: Implementar lógica do middleware
    next();
  } catch (error) {
    next(error);
  }
}
`;
  } else {
    return `import { Context, Next } from 'koa';
import { logger } from '../utils/logger${ext}';

export async function ${camelName}(ctx: Context, next: Next) {
  logger.info('Middleware ${pascalName} executado');
  // TODO: Implementar lógica do middleware
  await next();
}
`;
  }
}

function generateTestTemplate(name: string, type: string, framework: 'express' | 'koa'): string {
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);

  return `import request from 'supertest';
import app from '../index.js';

describe('${pascalName} ${type}', () => {
  describe('GET /api/${kebabName}', () => {
    it('deve retornar lista de ${name}', async () => {
      const response = await request(app)
        .get('/api/${kebabName}')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/${kebabName}', () => {
    it('deve criar um novo ${name}', async () => {
      const newItem = {
        // TODO: Adicionar dados de teste
      };

      const response = await request(app)
        .post('/api/${kebabName}')
        .send(newItem)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
});
`;
}

// ==================== MAIN GENERATE FUNCTION ====================

export async function generateResource(options: GenerateOptions): Promise<void> {
  const projectPath = process.cwd();

  // Verificar se é um projeto aggain
  const isProject = await isAggainProject(projectPath);
  if (!isProject) {
    logger.error(chalk.red('❌ Este comando deve ser executado dentro de um projeto aggain'));
    logger.info(chalk.yellow('💡 Execute "create-aggain <nome-projeto>" para criar um novo projeto'));
    process.exit(1);
  }

  // Detectar framework
  const detectedFramework = await detectFramework(projectPath);
  const framework = options.framework || detectedFramework || 'express';

  if (!detectedFramework) {
    logger.warn(chalk.yellow('⚠️  Não foi possível detectar o framework. Usando Express como padrão.'));
  }

  // Detectar TypeScript
  const isTypeScript = await detectTypeScript(projectPath);
  const fileExtension = isTypeScript ? 'ts' : 'js';

  const name = options.name;
  const kebabName = toKebabCase(name);
  const pascalName = toPascalCase(name);

  logger.info(chalk.blue(`🚀 Gerando ${options.type}: ${name} (${isTypeScript ? 'TypeScript' : 'JavaScript'})`));
  logger.info(chalk.blue(`📝 Usando extensão: .${fileExtension}`));

  try {
    const srcPath = path.join(projectPath, 'src');

    const useJsExtension = !isTypeScript;

    switch (options.type) {
      case 'route': {
        const routesDir = path.join(srcPath, 'routes');
        await mkdir(routesDir, { recursive: true });

        const routeFile = path.join(routesDir, `${kebabName}.routes.${fileExtension}`);
        const content = generateRouteTemplate(name, framework, useJsExtension);
        await writeFile(routeFile, content);

        logger.info(chalk.green(`✅ Rota criada: src/routes/${kebabName}.routes.${fileExtension}`));
        logger.info(chalk.yellow(`💡 Não esqueça de registrar a rota no arquivo principal (index.${fileExtension})`));
        logger.info(chalk.cyan(`   Adicione: app.use('/api/${kebabName}', ${kebabName}Routes);`));
        break;
      }

      case 'controller': {
        const controllersDir = path.join(srcPath, 'controllers');
        await mkdir(controllersDir, { recursive: true });

        const controllerFile = path.join(controllersDir, `${kebabName}.controller.${fileExtension}`);
        const content = generateControllerTemplate(name, framework, useJsExtension);
        await writeFile(controllerFile, content);

        logger.info(chalk.green(`✅ Controller criado: src/controllers/${kebabName}.controller.${fileExtension}`));
        break;
      }

      case 'service': {
        const servicesDir = path.join(srcPath, 'services');
        await mkdir(servicesDir, { recursive: true });

        const serviceFile = path.join(servicesDir, `${kebabName}.service.${fileExtension}`);
        const content = generateServiceTemplate(name, useJsExtension);
        await writeFile(serviceFile, content);

        logger.info(chalk.green(`✅ Service criado: src/services/${kebabName}.service.${fileExtension}`));
        break;
      }

      case 'model': {
        const modelsDir = path.join(srcPath, 'models');
        await mkdir(modelsDir, { recursive: true });

        const modelFile = path.join(modelsDir, `${kebabName}.model.${fileExtension}`);
        const content = generateModelTemplate(name);
        await writeFile(modelFile, content);

        logger.info(chalk.green(`✅ Model criado: src/models/${kebabName}.model.${fileExtension}`));
        break;
      }

      case 'middleware': {
        const middlewaresDir = path.join(srcPath, 'middlewares');
        await mkdir(middlewaresDir, { recursive: true });

        const middlewareFile = path.join(middlewaresDir, `${kebabName}.middleware.${fileExtension}`);
        const content = generateMiddlewareTemplate(name, framework, useJsExtension);
        await writeFile(middlewareFile, content);

        logger.info(chalk.green(`✅ Middleware criado: src/middlewares/${kebabName}.middleware.${fileExtension}`));
        break;
      }

      case 'test': {
        const testsDir = path.join(projectPath, 'tests');
        await mkdir(testsDir, { recursive: true });

        const testFile = path.join(testsDir, `${kebabName}.test.${fileExtension}`);
        const content = generateTestTemplate(name, 'test', framework);
        await writeFile(testFile, content);

        logger.info(chalk.green(`✅ Test criado: tests/${kebabName}.test.${fileExtension}`));
        break;
      }
    }

    logger.info(chalk.green(`\n✨ ${pascalName} ${options.type} gerado com sucesso!`));
  } catch (error: any) {
    logger.error(chalk.red(`❌ Erro ao gerar ${options.type}:`), error.message);
    process.exit(1);
  }
}

/**
 * Gera um conjunto completo de recursos (CRUD)
 */
export async function generateCrud(name: string, framework?: 'express' | 'koa'): Promise<void> {
  logger.info(chalk.blue(`🚀 Gerando CRUD completo para: ${name}`));

  await generateResource({ type: 'model', name, framework });
  await generateResource({ type: 'service', name, framework });
  await generateResource({ type: 'controller', name, framework });
  await generateResource({ type: 'route', name, framework });
  await generateResource({ type: 'test', name, framework });

  logger.info(chalk.green(`\n✨ CRUD completo gerado com sucesso!`));
  logger.info(chalk.yellow(`\n💡 Próximos passos:`));
  logger.info(chalk.cyan(`   1. Registre a rota no arquivo principal (src/index.ts)`));
  logger.info(chalk.cyan(`   2. Implemente a lógica de negócio no service`));
  logger.info(chalk.cyan(`   3. Adicione validações no controller`));
  logger.info(chalk.cyan(`   4. Execute os testes: npm test`));
}
