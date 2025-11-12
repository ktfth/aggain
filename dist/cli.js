#!/usr/bin/env node
import { generateSubmodule } from './generators/submodule.js';
import { userFieldSchema, validateAuthFramework, validateAuthOptions, validateAuthType, validateFramework, validateProjectName } from './utils/validation.js';
import { adminRouter } from './admin/index.js';
import chalk from 'chalk';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import express from 'express';
import { generateAuth } from './generators/auth.js';
import { generateComponent } from './generators/component.js';
import { generateCrud } from './generators/crud.js';
import { generateDenoProject } from './generators/deno.js';
import { generateExpressProject } from './generators/express.js';
import { generateKoaProject } from './generators/koa.js';
import { generateServiceFiles } from './generators/service.js';
import { hideBin } from 'yargs/helpers';
import { logger } from './utils/logger.js';
import path from 'path';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import yargs from 'yargs';
import { z } from 'zod';
const execAsync = promisify(exec);
// Criar servidor admin se necessário
let adminServer = null;
function startAdminServer(port = 3001) {
    if (!adminServer) {
        adminServer = express();
        adminServer.use(express.json());
        adminServer.use('/admin', adminRouter);
        adminServer.listen(port, () => {
            logger.info(chalk.blue(`🚀 Servidor admin rodando na porta ${port}`));
        });
    }
    return adminServer;
}
async function handleAuth(argv) {
    try {
        logger.info('Validando opções do comando...');
        // Validar tipo de autenticação
        logger.info('Validando tipo de autenticação...');
        const authType = validateAuthType(argv.type);
        // Validar framework
        logger.info('Validando framework...');
        const framework = validateAuthFramework(argv.framework);
        logger.info(`Opções validadas com sucesso:`, {
            type: authType,
            framework: framework,
            userFields: argv.userFields
        });
        // Processar campos do usuário
        let userFields = [];
        if (argv.userFields) {
            try {
                logger.info('Processando campos personalizados do usuário...');
                const parsedFields = JSON.parse(argv.userFields);
                userFields = z.array(userFieldSchema).parse(parsedFields);
                logger.info('Campos do usuário processados:', userFields);
            }
            catch (error) {
                if (error instanceof SyntaxError) {
                    logger.error('Erro ao processar JSON dos campos do usuário:', error);
                    throw new Error('Formato inválido dos campos do usuário. Formato esperado: [{"name": "nome", "type": "String", "required": true}, ...]');
                }
                if (error instanceof z.ZodError) {
                    logger.error('Erro de validação dos campos do usuário:', error.errors);
                    throw new Error('Campos do usuário inválidos. Cada campo deve ter name (string), type (string) e required (boolean opcional)');
                }
                throw error;
            }
        }
        // Validar opções completas
        logger.info('Validando opções completas...');
        const validatedOptions = validateAuthOptions({
            authType,
            userFields
        });
        // Gerar sistema de autenticação
        logger.info('Iniciando geração do sistema de autenticação...');
        await generateAuth(validatedOptions, framework, process.cwd());
        logger.info('Sistema de autenticação gerado com sucesso!');
        logger.info(`
      Próximos passos:
      1. Execute:
         ${authType === 'jwt' ?
            'npm install jsonwebtoken bcryptjs mongoose @types/jsonwebtoken @types/bcryptjs @types/mongoose --save' :
            'npm install express-session connect-mongo @types/express-session --save'}
      
      2. Configure as variáveis de ambiente:
         ${authType === 'jwt' ?
            'JWT_SECRET=seu_secret_aqui' :
            'SESSION_SECRET=seu_secret_aqui\nMONGO_URI=sua_uri_aqui'}
      
      3. Importe e use as rotas em src/index.ts:
         import authRoutes from './routes/auth.routes.js';
         app.use('/auth', authRoutes);
    `);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            logger.error('Erro de validação:', error.errors);
        }
        else {
            logger.error('Erro ao gerar sistema de autenticação:', error);
            if (error instanceof Error) {
                logger.error('Detalhes do erro:', error.message);
                if (error.stack) {
                    logger.error('Stack:', error.stack);
                }
            }
        }
        process.exit(1);
    }
}
async function handleComponent(argv) {
    try {
        const componentOptions = {
            name: argv.name,
            type: z.enum(['route', 'controller', 'service', 'middleware', 'model']).parse(argv.type),
            framework: z.enum(['express', 'koa', 'deno']).parse(argv.framework),
            baseDir: process.cwd(),
            includeTests: argv.tests
        };
        await generateComponent(componentOptions);
        logger.info(chalk.green(`✨ Componente ${argv.type} '${argv.name}' gerado com sucesso!`));
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            logger.error('Erro de validação:', error.errors);
        }
        else {
            logger.error('Erro ao gerar componente:', error);
        }
        process.exit(1);
    }
}
async function handleCrud(argv) {
    try {
        // Verificar se é um subcomponente
        if (!argv.submodule) {
            throw new Error('Use a flag --submodule ou -s para gerar um CRUD dentro de um projeto existente');
        }
        // Validar framework
        const validatedFramework = validateFramework(argv.framework);
        if (validatedFramework !== 'express' && validatedFramework !== 'koa') {
            throw new Error('CRUD só é suportado para os frameworks Express e Koa');
        }
        const framework = validatedFramework;
        // Validar campos da entidade
        let properties = [];
        try {
            properties = JSON.parse(argv.fields);
            if (!Array.isArray(properties)) {
                throw new Error('O campo fields deve ser um array');
            }
        }
        catch (error) {
            logger.error('Erro ao processar campos da entidade:', error);
            throw new Error('Formato inválido dos campos. Formato esperado: [{"name": "nome", "type": "String", "required": true}, ...]');
        }
        const options = {
            entityName: argv.name,
            properties
        };
        // Verificar se estamos em um projeto válido
        const srcPath = path.join(process.cwd(), 'src');
        if (!existsSync(srcPath)) {
            throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
        }
        // Verificar se o framework do projeto corresponde
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!existsSync(packageJsonPath)) {
            throw new Error('package.json não encontrado. Execute este comando dentro de um projeto existente.');
        }
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        const hasFramework = (framework === 'express' && packageJson.dependencies.express) ||
            (framework === 'koa' && packageJson.dependencies.koa);
        if (!hasFramework) {
            throw new Error(`Este projeto não parece ser um projeto ${framework}. Verifique o framework usado.`);
        }
        // Verificar se o MongoDB está configurado
        const hasMongoose = packageJson.dependencies.mongoose;
        if (!hasMongoose) {
            logger.warn('Mongoose não encontrado nas dependências. Você precisará instalá-lo:');
            logger.warn('npm install mongoose @types/mongoose --save');
        }
        // Gerar CRUD
        logger.info(`Iniciando geração do CRUD para entidade ${argv.name}...`);
        await generateCrud(options, framework, process.cwd());
        logger.info('CRUD gerado com sucesso!');
        logger.info(`
      Arquivos gerados:
      - src/models/${argv.name}.model.ts
      - src/controllers/${argv.name}.controller.ts
      - src/routes/${argv.name}.routes.ts

      Próximos passos:
      1. ${!hasMongoose ? 'Instale o Mongoose:\n         npm install mongoose @types/mongoose --save\n\n      2. ' : ''}Importe e use as rotas em src/index.ts:
         import ${argv.name}Routes from './routes/${argv.name}.routes.js';
         app.use('/${argv.name}s', ${argv.name}Routes);
      
      ${!hasMongoose ? '3' : '2'}. Teste as rotas:
         POST   /${argv.name}s      - Criar ${argv.name}
         GET    /${argv.name}s      - Listar todos
         GET    /${argv.name}s/:id  - Buscar por ID
         PUT    /${argv.name}s/:id  - Atualizar
         DELETE /${argv.name}s/:id  - Remover
    `);
    }
    catch (error) {
        logger.error('Erro ao gerar CRUD:', error);
        if (error instanceof Error) {
            logger.error('Detalhes do erro:', error.message);
            if (error.stack) {
                logger.error('Stack:', error.stack);
            }
        }
        process.exit(1);
    }
}
async function handleService(argv) {
    try {
        // Validar métodos do serviço
        let methods = [];
        try {
            methods = JSON.parse(argv.methods);
            if (!Array.isArray(methods)) {
                throw new Error('O campo methods deve ser um array');
            }
        }
        catch (error) {
            logger.error('Erro ao processar métodos do serviço:', error);
            throw new Error('Formato inválido dos métodos. Formato esperado: [{"name": "create", "params": [{"name": "data", "type": "any"}], "returnType": "Promise<void>"}, ...]');
        }
        const options = {
            name: argv.name,
            methods
        };
        // Gerar serviço
        logger.info('Iniciando geração do serviço...');
        await generateServiceFiles(options, argv.tests, process.cwd());
        logger.info('Serviço gerado com sucesso!');
        logger.info(`
      Próximos passos:
      1. Implemente os métodos do serviço em src/services/${argv.name}.service.ts
      ${argv.tests ? '2. Execute os testes com npm test' : ''}
    `);
    }
    catch (error) {
        logger.error('Erro ao gerar serviço:', error);
        if (error instanceof Error) {
            logger.error('Detalhes do erro:', error.message);
            if (error.stack) {
                logger.error('Stack:', error.stack);
            }
        }
        process.exit(1);
    }
}
// Configurar CLI com Yargs
yargs(hideBin(process.argv))
    .scriptName('create-aggain')
    .usage('$0 <comando> [opções]')
    .command({
    command: 'new <name>',
    aliases: ['create', 'init'],
    describe: 'Criar um novo projeto',
    builder: (yargs) => {
        return yargs
            .positional('name', {
            describe: 'Nome do projeto',
            type: 'string',
            demandOption: true
        })
            .option('framework', {
            alias: 'f',
            describe: 'Framework a ser usado',
            choices: ['express', 'koa', 'deno'],
            default: 'express'
        })
            .option('port', {
            alias: 'p',
            describe: 'Porta do servidor',
            type: 'number',
            default: 3000
        })
            .option('database', {
            alias: 'd',
            describe: 'Tipo de banco de dados',
            choices: ['mongodb', 'postgresql', 'mysql']
        })
            .option('typescript', {
            describe: 'Usar TypeScript',
            type: 'boolean',
            default: true
        })
            .option('tests', {
            describe: 'Incluir testes',
            type: 'boolean',
            default: true
        })
            .option('docker', {
            describe: 'Incluir Dockerfile',
            type: 'boolean',
            default: false
        })
            .option('admin', {
            describe: 'Iniciar servidor admin',
            type: 'boolean',
            default: false
        })
            .option('admin-port', {
            describe: 'Porta do servidor admin',
            type: 'number',
            default: 3001
        });
    },
    handler: async (argv) => {
        try {
            const projectOptions = {
                name: validateProjectName(argv.name),
                port: parseInt(String(argv.port), 10),
                database: argv.database,
                typescript: Boolean(argv.typescript),
                includeTests: Boolean(argv.tests),
                includeDocker: Boolean(argv.docker),
            };
            logger.info(`🚀 Iniciando geração do projeto ${projectOptions.name}`);
            const projectPath = path.join(process.cwd(), projectOptions.name);
            // Gerar projeto
            if (argv.framework === 'express') {
                await generateExpressProject(projectOptions);
            }
            else if (argv.framework === 'koa') {
                await generateKoaProject(projectOptions);
            }
            else if (argv.framework === 'deno') {
                await generateDenoProject(projectOptions);
            }
            else {
                throw new Error('Framework não suportado');
            }
            // Instalar dependências se não for um projeto Deno
            if (argv.framework !== 'deno') {
                logger.info(`📦 Instalando dependências...`);
                const { stdout, stderr } = await execAsync('npm install', { cwd: projectPath });
                if (stderr) {
                    logger.warn(`Avisos durante a instalação:`, stderr);
                }
                logger.info(`✨ Dependências instaladas com sucesso!`);
            }
            // Iniciar servidor admin se solicitado
            if (argv.admin) {
                const adminPort = parseInt(String(argv.adminPort), 10) || 3001;
                startAdminServer(adminPort);
            }
            logger.info(`✨ Projeto gerado com sucesso!`);
            logger.info(`
          Próximos passos:
          1. cd ${projectOptions.name}
          ${argv.framework === 'deno'
                ? `2. deno task dev`
                : `2. npm run dev`}
          ${argv.admin
                ? `\n      3. Acesse o admin em http://localhost:${argv.adminPort || 3001}/admin`
                : ''}
        `);
            logger.info(`Nome do projeto recebido: ${argv.name}`);
            logger.info(`Nome do projeto validado: ${projectOptions.name}`);
        }
        catch (error) {
            logger.error(`Erro ao gerar projeto:`, error);
            if (error instanceof Error) {
                logger.error('Detalhes do erro:', error.message);
                if (error.stack) {
                    logger.error('Stack:', error.stack);
                }
            }
            process.exit(1);
        }
    }
})
    .command({
    command: 'crud',
    describe: 'Gerar CRUD para uma entidade',
    builder: (yargs) => {
        return yargs
            .option('name', {
            alias: 'n',
            describe: 'Nome da entidade',
            type: 'string',
            demandOption: true
        })
            .option('framework', {
            alias: 'f',
            describe: 'Framework a ser usado',
            choices: ['express', 'koa'],
            demandOption: true
        })
            .option('fields', {
            describe: 'Campos da entidade em formato JSON',
            type: 'string',
            demandOption: true
        })
            .option('submodule', {
            alias: 's',
            describe: 'Indica que o CRUD será gerado dentro de um projeto existente',
            type: 'boolean',
            default: true
        })
            .check((argv) => {
            // Verificar se estamos em um projeto válido
            const srcPath = path.join(process.cwd(), 'src');
            if (!existsSync(srcPath)) {
                throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
            }
            return true;
        });
    },
    handler: handleCrud
})
    .command({
    command: 'auth',
    describe: 'Gerar sistema de autenticação',
    builder: (yargs) => {
        return yargs
            .option('type', {
            alias: 't',
            describe: 'Tipo de autenticação',
            choices: ['jwt', 'session'],
            demandOption: true
        })
            .option('framework', {
            alias: 'f',
            describe: 'Framework a ser usado',
            choices: ['express', 'koa'],
            demandOption: true
        })
            .option('user-fields', {
            alias: 'u',
            describe: 'Campos adicionais do usuário em formato JSON',
            type: 'string'
        })
            .check((argv) => {
            const srcPath = path.join(process.cwd(), 'src');
            if (!existsSync(srcPath)) {
                throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
            }
            return true;
        });
    },
    handler: handleAuth
})
    .command({
    command: 'component',
    describe: 'Gerar um novo componente',
    builder: (yargs) => {
        return yargs
            .option('name', {
            alias: 'n',
            describe: 'Nome do componente',
            type: 'string',
            demandOption: true
        })
            .option('type', {
            alias: 't',
            describe: 'Tipo do componente',
            choices: ['route', 'controller', 'service', 'middleware', 'model'],
            demandOption: true
        })
            .option('framework', {
            alias: 'f',
            describe: 'Framework a ser usado',
            choices: ['express', 'koa', 'deno'],
            demandOption: true
        })
            .option('tests', {
            describe: 'Incluir testes para o componente',
            type: 'boolean',
            default: false
        })
            .check((argv) => {
            const srcPath = path.join(process.cwd(), 'src');
            if (!existsSync(srcPath)) {
                throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
            }
            return true;
        });
    },
    handler: handleComponent
})
    .command({
    command: 'service',
    describe: 'Gerar um novo serviço',
    builder: (yargs) => {
        return yargs
            .option('name', {
            alias: 'n',
            describe: 'Nome do serviço',
            type: 'string',
            demandOption: true
        })
            .option('methods', {
            alias: 'm',
            describe: 'Métodos do serviço em formato JSON',
            type: 'string',
            demandOption: true
        })
            .option('tests', {
            describe: 'Incluir testes para o serviço',
            type: 'boolean',
            default: true
        })
            .check((argv) => {
            const srcPath = path.join(process.cwd(), 'src');
            if (!existsSync(srcPath)) {
                throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
            }
            return true;
        });
    },
    handler: handleService
})
    .command({
    command: 'submodule',
    describe: 'Gera um novo submódulo com controller, service, routes e validation',
    builder: (yargs) => {
        return yargs
            .option('module', {
            alias: 'm',
            describe: 'Nome do módulo pai',
            type: 'string',
            demandOption: true
        })
            .option('submodule', {
            alias: 's',
            describe: 'Nome do submódulo',
            type: 'string',
            demandOption: true
        })
            .option('framework', {
            alias: 'f',
            describe: 'Framework a ser usado (koa ou express)',
            type: 'string',
            demandOption: true,
            choices: ['koa', 'express']
        })
            .option('properties', {
            alias: 'p',
            describe: 'Propriedades do submódulo em formato JSON',
            type: 'string',
            demandOption: true
        });
    },
    handler: async (argv) => {
        try {
            const options = argv;
            const properties = JSON.parse(options.properties);
            const submoduleOptions = {
                moduleName: options.module,
                submoduleName: options.submodule,
                framework: options.framework,
                properties
            };
            await generateSubmodule(submoduleOptions, process.cwd());
        }
        catch (error) {
            logger.error('Erro ao gerar submódulo:', error);
            process.exit(1);
        }
    }
})
    .middleware([(argv) => {
        // Middleware para verificar se é um comando de submodule
        const submoduleCommands = ['crud', 'auth', 'component', 'service'];
        const command = String(argv._[0] || '');
        if (submoduleCommands.includes(command)) {
            const srcPath = path.join(process.cwd(), 'src');
            if (!existsSync(srcPath)) {
                throw new Error('Diretório src/ não encontrado. Execute este comando dentro de um projeto existente.');
            }
        }
    }])
    .demandCommand(1, 'Você precisa especificar um comando')
    .strict()
    .help()
    .version()
    .wrap(120)
    .epilogue('Para mais informações, visite https://github.com/kaiquewdev/aggain')
    .argv;
//# sourceMappingURL=cli.js.map