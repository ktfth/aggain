import { generateExpressController, generateExpressRoutes, generateKoaController, generateKoaRoutes, generateModel } from '../templates/crud.js';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import path from 'path';
export async function generateCrud(options, framework, projectPath) {
    const { entityName } = options;
    try {
        logger.info(`Iniciando geração do CRUD para a entidade: ${entityName}`);
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
        const modelFile = path.join(modelsPath, `${entityName}.model.ts`);
        const controllerFile = path.join(controllersPath, `${entityName}.controller.ts`);
        const routesFile = path.join(routesPath, `${entityName}.routes.ts`);
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
    }
    catch (error) {
        logger.error('Erro ao gerar CRUD:', error);
        throw error;
    }
}
//# sourceMappingURL=crud.js.map