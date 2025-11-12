import { generateAuthController, generateAuthMiddleware, generateAuthModel, generateAuthRoutes, generateAuthService } from '../templates/auth.js';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { logger } from '../utils/logger.js';
import path from 'path';
export async function generateAuth(options, framework, projectPath) {
    try {
        logger.info(`Iniciando geração do sistema de autenticação...`);
        logger.info(`Opções recebidas:`, { options, framework, projectPath });
        // Validar se o diretório do projeto existe
        if (!existsSync(projectPath)) {
            logger.error(`Diretório não encontrado: ${projectPath}`);
            throw new Error(`Diretório do projeto não encontrado: ${projectPath}`);
        }
        logger.info(`Diretório do projeto validado: ${projectPath}`);
        // Criar diretórios necessários
        logger.info(`Criando estrutura de diretórios...`);
        try {
            await mkdir(path.join(projectPath, 'src', 'models'), { recursive: true });
            await mkdir(path.join(projectPath, 'src', 'controllers'), { recursive: true });
            await mkdir(path.join(projectPath, 'src', 'routes'), { recursive: true });
            await mkdir(path.join(projectPath, 'src', 'services'), { recursive: true });
            await mkdir(path.join(projectPath, 'src', 'middleware'), { recursive: true });
            logger.info(`Estrutura de diretórios criada com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao criar diretórios:`, error);
            throw error;
        }
        // Gerar modelo de usuário
        logger.info(`Gerando modelo de usuário...`);
        try {
            const modelContent = generateAuthModel(options);
            await writeFile(path.join(projectPath, 'src', 'models', 'user.model.ts'), modelContent);
            logger.info(`Modelo de usuário gerado com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao gerar modelo de usuário:`, error);
            throw error;
        }
        // Gerar serviço de autenticação
        logger.info(`Gerando serviço de autenticação...`);
        try {
            const serviceContent = generateAuthService(options);
            await writeFile(path.join(projectPath, 'src', 'services', 'auth.service.ts'), serviceContent);
            logger.info(`Serviço de autenticação gerado com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao gerar serviço de autenticação:`, error);
            throw error;
        }
        // Gerar controller
        logger.info(`Gerando controller de autenticação...`);
        try {
            const controllerContent = generateAuthController(options, framework);
            await writeFile(path.join(projectPath, 'src', 'controllers', 'auth.controller.ts'), controllerContent);
            logger.info(`Controller de autenticação gerado com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao gerar controller de autenticação:`, error);
            throw error;
        }
        // Gerar middleware de autenticação
        logger.info(`Gerando middleware de autenticação...`);
        try {
            const middlewareContent = generateAuthMiddleware(options, framework);
            await writeFile(path.join(projectPath, 'src', 'middleware', 'auth.middleware.ts'), middlewareContent);
            logger.info(`Middleware de autenticação gerado com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao gerar middleware de autenticação:`, error);
            throw error;
        }
        // Gerar rotas
        logger.info(`Gerando rotas de autenticação...`);
        try {
            const routesContent = generateAuthRoutes(options, framework);
            await writeFile(path.join(projectPath, 'src', 'routes', 'auth.routes.ts'), routesContent);
            logger.info(`Rotas de autenticação geradas com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao gerar rotas de autenticação:`, error);
            throw error;
        }
        // Atualizar dependências no package.json
        logger.info(`Atualizando package.json...`);
        try {
            const dependencies = [
                'jsonwebtoken',
                'bcryptjs',
                'mongoose',
                ...(options.authType === 'session' ? ['express-session', 'connect-mongo'] : [])
            ];
            const devDependencies = [
                '@types/jsonwebtoken',
                '@types/bcryptjs',
                '@types/mongoose',
                ...(options.authType === 'session' ? ['@types/express-session', '@types/connect-mongo'] : [])
            ];
            // Ler o package.json existente
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (!existsSync(packageJsonPath)) {
                logger.error(`package.json não encontrado em: ${packageJsonPath}`);
                throw new Error(`package.json não encontrado em: ${packageJsonPath}`);
            }
            const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            // Adicionar novas dependências
            packageJson.dependencies = {
                ...packageJson.dependencies,
                ...dependencies.reduce((acc, dep) => ({ ...acc, [dep]: '^1.0.0' }), {})
            };
            packageJson.devDependencies = {
                ...packageJson.devDependencies,
                ...devDependencies.reduce((acc, dep) => ({ ...acc, [dep]: '^1.0.0' }), {})
            };
            // Salvar package.json atualizado
            await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
            logger.info(`package.json atualizado com sucesso`);
        }
        catch (error) {
            logger.error(`Erro ao atualizar package.json:`, error);
            throw error;
        }
        logger.info(`Sistema de autenticação gerado com sucesso!`);
        logger.info(`
      Próximos passos:
      1. Execute: npm install
      2. Configure a variável de ambiente JWT_SECRET
      3. Configure a conexão com o MongoDB em src/config/database.ts
      4. Importe e use as rotas de autenticação no seu arquivo principal
    `);
    }
    catch (error) {
        logger.error('Erro ao gerar sistema de autenticação:', error);
        if (error instanceof Error) {
            logger.error('Detalhes do erro:', error.message);
            logger.error('Stack:', error.stack);
        }
        throw error;
    }
}
//# sourceMappingURL=auth.js.map