import { mkdir, writeFile } from 'fs/promises';

import type { ProjectOptions } from '../types/index.js';
import { logger } from '../utils/logger.js';
import path from 'path';

function generateTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "CommonJS",
      moduleResolution: "Node",
      lib: ["ES2022"],
      outDir: "dist",
      rootDir: "src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      sourceMap: true,
      types: ["node"]
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "**/*.test.ts"]
  }, null, 2);
}

function generateErrorMiddleware(): string {
  return `import { Context, Next } from 'koa';
import { logger } from '../utils/logger';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    logger.error('Erro na requisição:', err);
    ctx.status = err?.status || 500;
    ctx.body = {
      error: {
        message: err?.message || 'Erro interno do servidor',
        status: ctx.status
      }
    };
  }
}`;
}

function generateValidationMiddleware(): string {
  return `import { Context, Next } from 'koa';
import { z } from 'zod';

const exampleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

export async function validateExample(ctx: Context, next: Next) {
  try {
    const data = ctx.request.body;
    await exampleSchema.parseAsync(data);
    await next();
  } catch (error: any) {
    ctx.status = 400;
    ctx.body = {
      error: {
        message: 'Dados inválidos',
        details: error?.errors || []
      }
    };
  }
}`;
}

function generateLogger(): string {
  return `import winston from 'winston';

const { format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

const customFormat = printf((info) => {
  return \`\${info.timestamp} [\${info.level}]: \${info.message}\`;
});

export const logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    new transports.Console({
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    }),
    new transports.File({
      filename: 'error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      ),
    }),
  ],
});`;
}

export async function generateKoaProject(options: ProjectOptions): Promise<void> {
  const projectDir = path.join(process.cwd(), options.name);

  try {
    // Criar diretórios
    await mkdir(projectDir, { recursive: true });
    await mkdir(path.join(projectDir, 'src'), { recursive: true });
    await mkdir(path.join(projectDir, 'src/routes'), { recursive: true });
    await mkdir(path.join(projectDir, 'src/controllers'), { recursive: true });
    await mkdir(path.join(projectDir, 'src/middlewares'), { recursive: true });
    await mkdir(path.join(projectDir, 'src/services'), { recursive: true });
    await mkdir(path.join(projectDir, 'src/utils'), { recursive: true });
    if (options.includeTests) {
      await mkdir(path.join(projectDir, 'tests'), { recursive: true });
    }

    // Gerar arquivos de configuração
    await writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify(generatePackageJson(options), null, 2)
    );

    await writeFile(
      path.join(projectDir, 'tsconfig.json'),
      generateTsConfig()
    );

    // Gerar arquivos principais
    await writeFile(
      path.join(projectDir, 'src/index.ts'),
      generateMainFile(options)
    );

    await writeFile(
      path.join(projectDir, 'src/routes/example.ts'),
      generateExampleRoute()
    );

    await writeFile(
      path.join(projectDir, 'src/controllers/example.ts'),
      generateExampleController()
    );

    // Gerar middlewares
    await writeFile(
      path.join(projectDir, 'src/middlewares/error.ts'),
      generateErrorMiddleware()
    );

    await writeFile(
      path.join(projectDir, 'src/middlewares/validation.ts'),
      generateValidationMiddleware()
    );

    // Gerar utilitários
    await writeFile(
      path.join(projectDir, 'src/utils/logger.ts'),
      generateLogger()
    );

    if (options.includeTests) {
      await writeFile(
        path.join(projectDir, 'tests/example.test.ts'),
        generateExampleTest()
      );
    }

    if (options.includeDocker) {
      await writeFile(
        path.join(projectDir, 'Dockerfile'),
        generateDockerfile(options)
      );
    }

    logger.info(`Projeto Koa gerado com sucesso em ${projectDir}`);
  } catch (error) {
    logger.error('Erro ao gerar projeto Koa:', error);
    throw error;
  }
}

function generatePackageJson(options: ProjectOptions): object {
  return {
    name: options.name,
    version: '1.0.0',
    description: 'BFF gerado com Koa',
    main: 'dist/index.js',
    scripts: {
      start: 'node dist/index.js',
      dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
      build: 'tsc',
      test: options.includeTests ? 'jest' : 'echo "No tests configured"',
      lint: 'eslint . --ext .ts',
      format: 'prettier --write "src/**/*.ts"'
    },
    dependencies: {
      koa: '^2.15.0',
      '@koa/router': '^12.0.1',
      '@koa/cors': '^5.0.0',
      'koa-helmet': '^7.0.2',
      'koa-compress': '^5.1.1',
      'koa-bodyparser': '^4.4.1',
      'winston': '^3.11.0',
      'zod': '^3.22.4'
    },
    devDependencies: {
      '@types/koa': '^2.13.12',
      '@types/koa__router': '^12.0.4',
      '@types/koa__cors': '^5.0.0',
      '@types/koa-compress': '^4.0.6',
      '@types/koa-bodyparser': '^4.3.12',
      '@types/node': '^20.11.5',
      typescript: '^5.3.3',
      'ts-node': '^10.9.2',
      'ts-node-dev': '^2.0.0',
      ...(options.includeTests ? {
        jest: '^29.7.0',
        '@types/jest': '^29.5.11',
        'ts-jest': '^29.1.1',
        'supertest': '^6.3.3',
        '@types/supertest': '^6.0.2'
      } : {})
    }
  };
}

function generateMainFile(options: ProjectOptions): string {
  return `import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import compress from 'koa-compress';
import bodyParser from 'koa-bodyparser';
import { exampleRouter } from './routes/example';
import { errorHandler } from './middlewares/error';
import { logger } from './utils/logger';

const app = new Koa();
const router = new Router();
const port = ${options.port};

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser());
app.use(errorHandler);

// Rotas
router.use('/api', exampleRouter.routes());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  logger.info(\`Servidor rodando na porta \${port}\`);
});

export default app;`;
}

function generateExampleRoute(): string {
  return `import Router from '@koa/router';
import { ExampleController } from '../controllers/example';
import { validateExample } from '../middlewares/validation';

const router = new Router();
const controller = new ExampleController();

router.get('/example', controller.getExample);
router.post('/example', validateExample, controller.createExample);

export const exampleRouter = router;`;
}

function generateExampleController(): string {
  return `import { Context } from 'koa';

export class ExampleController {
  async getExample(ctx: Context) {
    try {
      ctx.body = { message: 'Exemplo de resposta GET' };
    } catch (error: any) {
      ctx.throw(error?.message || 'Erro interno do servidor', 500);
    }
  }

  async createExample(ctx: Context) {
    try {
      const data = ctx.request.body;
      ctx.status = 201;
      ctx.body = {
        message: 'Exemplo de resposta POST',
        data
      };
    } catch (error: any) {
      ctx.throw(error?.message || 'Erro interno do servidor', 500);
    }
  }
}`;
}

function generateExampleTest(): string {
  return `import request from 'supertest';
import app from '../src/index';

describe('Example API', () => {
  const server = app.listen();

  afterAll(() => {
    server.close();
  });

  it('should return example response for GET /api/example', async () => {
    const response = await request(server)
      .get('/api/example')
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('should create example for POST /api/example', async () => {
    const data = { test: 'data' };
    const response = await request(server)
      .post('/api/example')
      .send(data)
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(data);
  });
});`;
}

function generateDockerfile(options: ProjectOptions): string {
  return `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE ${options.port}

CMD ["npm", "start"]`;
} 