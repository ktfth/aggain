import {
  CrudOptions,
  generateExpressController,
  generateExpressRoutes,
  generateKoaController,
  generateKoaRoutes,
  generateModel
} from '../templates/crud.js';
import { mkdir, writeFile, readFile, access } from 'fs/promises';

import { existsSync, constants } from 'fs';
import { logger } from '../utils/logger.js';
import path from 'path';

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

export async function generateCrud(
  options: CrudOptions,
  framework: 'koa' | 'express',
  projectPath: string
): Promise<void> {
  const { entityName } = options;

  try {
    logger.info(`Iniciando geração do CRUD para a entidade: ${entityName}`);

    // Detectar TypeScript
    const isTypeScript = await detectTypeScript(projectPath);
    const fileExtension = isTypeScript ? 'ts' : 'js';
    logger.info(`Detectado: ${isTypeScript ? 'TypeScript' : 'JavaScript'} - usando extensão .${fileExtension}`);

    // Verificar se os diretórios base existem
    const srcPath = path.join(projectPath, 'src');
    const modelsPath = path.join(srcPath, 'models');
    const controllersPath = path.join(srcPath, 'controllers');
    const routesPath = path.join(srcPath, 'routes');

    logger.info(`Verificando se o diretório src existe em: ${srcPath}`);
    if (!existsSync(srcPath)) {
      logger.error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
      throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
    }

    // Criar diretórios se não existirem
    logger.info(`Criando diretórios para models, controllers e routes se não existirem...`);
    await mkdir(modelsPath, { recursive: true });
    await mkdir(controllersPath, { recursive: true });
    await mkdir(routesPath, { recursive: true });

    // Verificar se os arquivos já existem
    logger.info(`Verificando se os arquivos já existem para a entidade: ${entityName}`);
    const modelFile = path.join(modelsPath, `${entityName}.model.${fileExtension}`);
    const controllerFile = path.join(controllersPath, `${entityName}.controller.${fileExtension}`);
    const routesFile = path.join(routesPath, `${entityName}.routes.${fileExtension}`);

    if (existsSync(modelFile) || existsSync(controllerFile) || existsSync(routesFile)) {
      logger.error(`Arquivos para a entidade ${entityName} já existem. Escolha outro nome ou remova os arquivos existentes.`);
      throw new Error(`Arquivos para a entidade ${entityName} já existem. Escolha outro nome ou remova os arquivos existentes.`);
    }

    logger.info(`Verificando diretórios base para ${entityName}...`);
    logger.info(`Diretório src: ${srcPath}`);
    logger.info(`Diretório models: ${modelsPath}`);
    logger.info(`Diretório controllers: ${controllersPath}`);
    logger.info(`Diretório routes: ${routesPath}`);

    // Gerar modelo
    logger.info(`Gerando modelo para ${entityName} no arquivo: ${modelFile}`);
    const modelContent = generateModel(options);
    await writeFile(modelFile, modelContent);

    // Gerar controller
    logger.info(`Gerando controller para ${entityName} no arquivo: ${controllerFile}`);
    const controllerContent = framework === 'koa'
      ? generateKoaController(options)
      : generateExpressController(options);
    await writeFile(controllerFile, controllerContent);

    // Gerar rotas
    logger.info(`Gerando rotas para ${entityName} no arquivo: ${routesFile}`);
    const routesContent = framework === 'koa'
      ? generateKoaRoutes(options)
      : generateExpressRoutes(options);
    await writeFile(routesFile, routesContent);

    logger.info(`CRUD para ${entityName} gerado com sucesso! Arquivos criados:`);
    logger.info(`- Modelo: ${modelFile}`);
    logger.info(`- Controller: ${controllerFile}`);
    logger.info(`- Rotas: ${routesFile}`);
  } catch (error) {
    logger.error('Erro ao gerar CRUD:', error);
    throw error;
  }
} 