import { mkdir, writeFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import path from 'path';
function generateTsConfig() {
    return JSON.stringify({
        compilerOptions: {
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
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
        "ts-node": {
            esm: true,
            experimentalSpecifiers: true
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist", "**/*.test.ts"]
    }, null, 2);
}
function generateErrorMiddleware() {
    return `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Erro na requisição:', err);
  res.status(500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status: 500
    }
  });
}`;
}
function generateValidationMiddleware() {
    return `import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const exampleSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
});

export async function validateExample(req: Request, res: Response, next: NextFunction) {
  try {
    await exampleSchema.parseAsync(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      error: {
        message: 'Dados inválidos',
        details: error?.errors || []
      }
    });
  }
}`;
}
function generateLogger() {
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
export async function generateExpressProject(options) {
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
        await writeFile(path.join(projectDir, 'package.json'), JSON.stringify(generatePackageJson(options), null, 2));
        await writeFile(path.join(projectDir, 'tsconfig.json'), generateTsConfig());
        // Gerar arquivos principais
        await writeFile(path.join(projectDir, 'src/index.ts'), generateMainFile(options));
        await writeFile(path.join(projectDir, 'src/routes/example.ts'), generateExampleRoute());
        await writeFile(path.join(projectDir, 'src/controllers/example.ts'), generateExampleController());
        // Gerar middlewares
        await writeFile(path.join(projectDir, 'src/middlewares/error.ts'), generateErrorMiddleware());
        await writeFile(path.join(projectDir, 'src/middlewares/validation.ts'), generateValidationMiddleware());
        // Gerar utilitários
        await writeFile(path.join(projectDir, 'src/utils/logger.ts'), generateLogger());
        if (options.includeTests) {
            await writeFile(path.join(projectDir, 'tests/example.test.ts'), generateExampleTest());
        }
        if (options.includeDocker) {
            await writeFile(path.join(projectDir, 'Dockerfile'), generateDockerfile(options));
        }
        logger.info(`Projeto Express gerado com sucesso em ${projectDir}`);
    }
    catch (error) {
        logger.error('Erro ao gerar projeto Express:', error);
        throw error;
    }
}
function generatePackageJson(options) {
    return {
        name: options.name,
        version: '1.0.0',
        description: 'BFF gerado com Express',
        type: "module",
        main: 'dist/index.js',
        scripts: {
            start: 'node dist/index.js',
            dev: 'tsx watch src/index.ts',
            build: 'tsc',
            test: options.includeTests ? 'jest' : 'echo "No tests configured"',
            lint: 'eslint . --ext .ts',
            format: 'prettier --write "src/**/*.ts"'
        },
        dependencies: {
            express: '^4.18.2',
            'cors': '^2.8.5',
            'helmet': '^7.1.0',
            'compression': '^1.7.4',
            'express-validator': '^7.0.1',
            'winston': '^3.11.0',
            'zod': '^3.22.4'
        },
        devDependencies: {
            '@types/express': '^4.17.21',
            '@types/node': '^20.11.5',
            '@types/cors': '^2.8.17',
            '@types/compression': '^1.7.5',
            typescript: '^5.3.3',
            'tsx': '^4.7.0',
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
function generateMainFile(options) {
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { exampleRouter } from './routes/example.js';
import { errorHandler } from './middlewares/error.js';
import { logger } from './utils/logger.js';

const app = express();
const port = ${options.port};

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Rotas
app.use('/api', exampleRouter);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  logger.info(\`Servidor rodando na porta \${port}\`);
});

export default app;`;
}
function generateExampleRoute() {
    return `import { Router } from 'express';
import { ExampleController } from '../controllers/example.js';
import { validateExample } from '../middlewares/validation.js';

const router = Router();
const controller = new ExampleController();

router.get('/example', controller.getExample);
router.post('/example', validateExample, controller.createExample);

export const exampleRouter = router;`;
}
function generateExampleController() {
    return `import { Request, Response, NextFunction } from 'express';

export class ExampleController {
  async getExample(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ message: 'Exemplo de resposta GET' });
    } catch (error) {
      next(error);
    }
  }

  async createExample(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      res.status(201).json({ 
        message: 'Exemplo de resposta POST',
        data 
      });
    } catch (error) {
      next(error);
    }
  }
}`;
}
function generateExampleTest() {
    return `import request from 'supertest';
import app from '../src/index.js';

describe('Example API', () => {
  it('should return example response for GET /api/example', async () => {
    const response = await request(app)
      .get('/api/example')
      .expect(200);

    expect(response.body).toHaveProperty('message');
  });

  it('should create example for POST /api/example', async () => {
    const data = { test: 'data' };
    const response = await request(app)
      .post('/api/example')
      .send(data)
      .expect(201);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toEqual(data);
  });
});`;
}
function generateDockerfile(options) {
    return `FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE ${options.port}

CMD ["npm", "start"]`;
}
//# sourceMappingURL=express.js.map