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
import { AppError } from '../utils/errors.js';

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction) {
  logger.error('Erro na requisição:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
      },
    });
  }

  // Erro não tratado
  res.status(500).json({
    error: {
      message: err.message || 'Erro interno do servidor',
      status: 500,
    },
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

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
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
}

export async function validateUser(req: Request, res: Response, next: NextFunction) {
  try {
    await userSchema.parseAsync(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      error: {
        message: 'Dados inválidos',
        details: error?.errors || []
      }
    });
  }
}

export async function validateLogin(req: Request, res: Response, next: NextFunction) {
  try {
    await loginSchema.parseAsync(req.body);
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
function generateEnvFile(options) {
    return `# Application
NODE_ENV=development
PORT=${options.port}
APP_NAME=${options.name}

# Database
${options.database === 'mongodb' ? `MONGODB_URI=mongodb://localhost:27017/${options.name}` : ''}${options.database === 'postgresql' ? `DATABASE_URL=postgresql://user:password@localhost:5432/${options.name}` : ''}${options.database === 'mysql' ? `DATABASE_URL=mysql://user:password@localhost:3306/${options.name}` : ''}

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
}
function generateConfig() {
    return `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appName: process.env.APP_NAME || 'api',

  database: {
    url: process.env.DATABASE_URL || process.env.MONGODB_URI || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};`;
}
function generateCustomErrors() {
    return `export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}`;
}
function generateAuthMiddleware() {
    return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('Token não fornecido');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string };
    req.user = decoded;

    next();
  } catch (error) {
    next(new UnauthorizedError('Token inválido ou expirado'));
  }
}`;
}
function generateHealthRoute() {
    return `import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/ready', (req: Request, res: Response) => {
  // Adicione verificações de dependências aqui (database, cache, etc)
  res.json({
    status: 'READY',
    timestamp: new Date().toISOString(),
  });
});

export const healthRouter = router;`;
}
function generateSwaggerConfig() {
    return `import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { config } from './index.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.appName + ' API',
      version: '1.0.0',
      description: 'API documentation',
    },
    servers: [
      {
        url: \`http://localhost:\${config.port}\`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}`;
}
function generateDatabaseConnection(database) {
    if (database === 'mongodb') {
        return `import mongoose from 'mongoose';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.database.url);
    logger.info('MongoDB conectado com sucesso');
  } catch (error) {
    logger.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB desconectado');
}`;
    }
    else if (database === 'postgresql' || database === 'mysql') {
        return `import { DataSource } from 'typeorm';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export const AppDataSource = new DataSource({
  type: '${database}',
  url: config.database.url,
  synchronize: config.env === 'development',
  logging: config.env === 'development',
  entities: ['src/models/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

export async function connectDatabase(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info('${database === 'postgresql' ? 'PostgreSQL' : 'MySQL'} conectado com sucesso');
  } catch (error) {
    logger.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await AppDataSource.destroy();
  logger.info('Banco de dados desconectado');
}`;
    }
    return `// Nenhum banco de dados configurado
export async function connectDatabase(): Promise<void> {
  // Adicione sua configuração de banco de dados aqui
}

export async function disconnectDatabase(): Promise<void> {
  // Cleanup
}`;
}
function generateMongooseModel() {
    return `import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);`;
}
function generateTypeORMEntity() {
    return `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}`;
}
function generateUserService(database) {
    const isMongoose = database === 'mongodb';
    const isTypeORM = database === 'postgresql' || database === 'mysql';
    return `import { ${isMongoose ? 'User, IUser' : isTypeORM ? 'User' : 'User'} } from '../models/User.js';
${isTypeORM ? "import { AppDataSource } from '../utils/database.js';" : ''}
import { NotFoundError, ConflictError } from '../utils/errors.js';
import bcrypt from 'bcrypt';

${isTypeORM ? 'const userRepository = AppDataSource.getRepository(User);' : ''}

export class UserService {
  async create(data: { name: string; email: string; password: string }): Promise<${isMongoose ? 'IUser' : 'User'}> {
    // Verificar se o email já existe
    ${isMongoose ? 'const existingUser = await User.findOne({ email: data.email });' : isTypeORM ? 'const existingUser = await userRepository.findOne({ where: { email: data.email } });' : 'const existingUser = null;'}

    if (existingUser) {
      throw new ConflictError('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    ${isMongoose ? `const user = await User.create({
      ...data,
      password: hashedPassword,
    });` : isTypeORM ? `const user = userRepository.create({
      ...data,
      password: hashedPassword,
    });
    await userRepository.save(user);` : `const user = { ...data, password: hashedPassword, id: '1' };`}

    return user;
  }

  async findAll(): Promise<${isMongoose ? 'IUser' : 'User'}[]> {
    ${isMongoose ? 'return await User.find().select(\'-password\');' : isTypeORM ? 'return await userRepository.find({ select: [\'id\', \'name\', \'email\', \'createdAt\', \'updatedAt\'] });' : 'return [];'}
  }

  async findById(id: string): Promise<${isMongoose ? 'IUser' : 'User'}> {
    ${isMongoose ? 'const user = await User.findById(id).select(\'-password\');' : isTypeORM ? 'const user = await userRepository.findOne({ where: { id }, select: [\'id\', \'name\', \'email\', \'createdAt\', \'updatedAt\'] });' : 'const user = null;'}

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, data: Partial<{ name: string; email: string; password: string }>): Promise<${isMongoose ? 'IUser' : 'User'}> {
    ${isMongoose ? 'const user = await User.findById(id);' : isTypeORM ? 'const user = await userRepository.findOne({ where: { id } });' : 'const user = null;'}

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    ${isMongoose ? 'Object.assign(user, data);\n    await user.save();' : isTypeORM ? 'Object.assign(user, data);\n    await userRepository.save(user);' : ''}

    return user;
  }

  async delete(id: string): Promise<void> {
    ${isMongoose ? 'const user = await User.findByIdAndDelete(id);' : isTypeORM ? 'const result = await userRepository.delete(id);\n    const user = result.affected ? {} : null;' : 'const user = null;'}

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }
  }

  async findByEmail(email: string): Promise<${isMongoose ? 'IUser' : 'User'} | null> {
    ${isMongoose ? 'return await User.findOne({ email });' : isTypeORM ? 'return await userRepository.findOne({ where: { email } });' : 'return null;'}
  }
}`;
}
function generateUserController(database) {
    return `import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService.js';

const userService = new UserService();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}`;
}
function generateUserRoutes() {
    return `import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { validateUser } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();
const controller = new UserController();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

// Rotas públicas
router.post('/', validateUser, controller.create);

// Rotas protegidas
router.get('/', authenticate, controller.findAll);
router.get('/:id', authenticate, controller.findById);
router.put('/:id', authenticate, validateUser, controller.update);
router.delete('/:id', authenticate, controller.delete);

export const userRouter = router;`;
}
function generateAuthService() {
    return `import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config/index.js';
import { UserService } from './UserService.js';
import { UnauthorizedError } from '../utils/errors.js';

const userService = new UserService();

export class AuthService {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const user = await userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Remove password from response
    const userResponse = user.toObject ? user.toObject() : { ...user };
    delete userResponse.password;

    return { token, user: userResponse };
  }

  async register(data: { name: string; email: string; password: string }): Promise<{ token: string; user: any }> {
    const user = await userService.create(data);

    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const userResponse = user.toObject ? user.toObject() : { ...user };
    delete userResponse.password;

    return { token, user: userResponse };
  }
}`;
}
function generateAuthController() {
    return `import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Realizar login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 */
export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}`;
}
function generateAuthRoutes() {
    return `import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateLogin, validateUser } from '../middlewares/validation.js';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação
 */

router.post('/login', validateLogin, controller.login);
router.post('/register', validateUser, controller.register);

export const authRouter = router;`;
}
export async function generateExpressProject(options) {
    const projectDir = path.join(process.cwd(), options.name);
    const hasDatabase = !!options.database;
    try {
        // Criar diretórios
        await mkdir(projectDir, { recursive: true });
        await mkdir(path.join(projectDir, 'src'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/config'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/routes'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/controllers'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/middlewares'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/services'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/utils'), { recursive: true });
        if (hasDatabase) {
            await mkdir(path.join(projectDir, 'src/models'), { recursive: true });
        }
        if (options.includeTests) {
            await mkdir(path.join(projectDir, 'tests'), { recursive: true });
        }
        // Gerar arquivos de configuração
        await writeFile(path.join(projectDir, '.env'), generateEnvFile(options));
        await writeFile(path.join(projectDir, '.env.example'), generateEnvFile(options));
        await writeFile(path.join(projectDir, '.gitignore'), `node_modules/
dist/
.env
error.log
coverage/
*.log
.DS_Store`);
        await writeFile(path.join(projectDir, 'package.json'), JSON.stringify(generatePackageJson(options), null, 2));
        await writeFile(path.join(projectDir, 'tsconfig.json'), generateTsConfig());
        // Gerar config
        await writeFile(path.join(projectDir, 'src/config/index.ts'), generateConfig());
        await writeFile(path.join(projectDir, 'src/config/swagger.ts'), generateSwaggerConfig());
        // Gerar arquivo principal
        await writeFile(path.join(projectDir, 'src/index.ts'), generateMainFile(options));
        // Gerar rotas
        await writeFile(path.join(projectDir, 'src/routes/health.ts'), generateHealthRoute());
        await writeFile(path.join(projectDir, 'src/routes/example.ts'), generateExampleRoute());
        if (hasDatabase) {
            await writeFile(path.join(projectDir, 'src/routes/auth.ts'), generateAuthRoutes());
            await writeFile(path.join(projectDir, 'src/routes/user.ts'), generateUserRoutes());
        }
        // Gerar controllers
        await writeFile(path.join(projectDir, 'src/controllers/example.ts'), generateExampleController());
        if (hasDatabase) {
            await writeFile(path.join(projectDir, 'src/controllers/AuthController.ts'), generateAuthController());
            await writeFile(path.join(projectDir, 'src/controllers/UserController.ts'), generateUserController(options.database));
        }
        // Gerar services
        if (hasDatabase) {
            await writeFile(path.join(projectDir, 'src/services/AuthService.ts'), generateAuthService());
            await writeFile(path.join(projectDir, 'src/services/UserService.ts'), generateUserService(options.database));
        }
        // Gerar models
        if (hasDatabase) {
            if (options.database === 'mongodb') {
                await writeFile(path.join(projectDir, 'src/models/User.ts'), generateMongooseModel());
            }
            else if (options.database === 'postgresql' || options.database === 'mysql') {
                await writeFile(path.join(projectDir, 'src/models/User.ts'), generateTypeORMEntity());
            }
        }
        // Gerar middlewares
        await writeFile(path.join(projectDir, 'src/middlewares/error.ts'), generateErrorMiddleware());
        await writeFile(path.join(projectDir, 'src/middlewares/validation.ts'), generateValidationMiddleware());
        if (hasDatabase) {
            await writeFile(path.join(projectDir, 'src/middlewares/auth.ts'), generateAuthMiddleware());
        }
        // Gerar utilitários
        await writeFile(path.join(projectDir, 'src/utils/logger.ts'), generateLogger());
        await writeFile(path.join(projectDir, 'src/utils/errors.ts'), generateCustomErrors());
        if (hasDatabase) {
            await writeFile(path.join(projectDir, 'src/utils/database.ts'), generateDatabaseConnection(options.database));
        }
        // Gerar testes
        if (options.includeTests) {
            await writeFile(path.join(projectDir, 'tests/example.test.ts'), generateExampleTest());
        }
        // Gerar Docker
        if (options.includeDocker) {
            await writeFile(path.join(projectDir, 'Dockerfile'), generateDockerfile(options));
            await writeFile(path.join(projectDir, 'docker-compose.yml'), generateDockerCompose(options));
        }
        // Gerar README
        await writeFile(path.join(projectDir, 'README.md'), generateREADME(options));
        logger.info(`✅ Projeto Express gerado com sucesso em ${projectDir}`);
        logger.info(`📁 Estrutura de pastas criada`);
        logger.info(`🔧 Configurações aplicadas`);
        if (hasDatabase) {
            logger.info(`🗄️  Integração com ${options.database} configurada`);
        }
        logger.info(`📚 Documentação Swagger disponível em /api-docs`);
        logger.info(`\n📝 Próximos passos:`);
        logger.info(`   cd ${options.name}`);
        logger.info(`   npm install`);
        logger.info(`   npm run dev`);
    }
    catch (error) {
        logger.error('Erro ao gerar projeto Express:', error);
        throw error;
    }
}
function generatePackageJson(options) {
    const databaseDeps = {};
    const databaseDevDeps = {};
    if (options.database === 'mongodb') {
        databaseDeps.mongoose = '^8.1.0';
    }
    else if (options.database === 'postgresql' || options.database === 'mysql') {
        databaseDeps.typeorm = '^0.3.20';
        databaseDeps['reflect-metadata'] = '^0.2.1';
        if (options.database === 'postgresql') {
            databaseDeps.pg = '^8.11.3';
        }
        else {
            databaseDeps.mysql2 = '^3.7.0';
        }
    }
    return {
        name: options.name,
        version: '1.0.0',
        description: 'API moderna gerada com Express',
        type: "module",
        main: 'dist/index.js',
        scripts: {
            start: 'node dist/index.js',
            dev: 'tsx watch src/index.ts',
            build: 'tsc',
            test: options.includeTests ? 'jest' : 'echo "No tests configured"',
            lint: 'eslint . --ext .ts',
            format: 'prettier --write "src/**/*.ts"',
            generate: 'aggain-generate'
        },
        dependencies: {
            express: '^4.18.2',
            'cors': '^2.8.5',
            'helmet': '^7.1.0',
            'compression': '^1.7.4',
            'dotenv': '^16.4.0',
            'jsonwebtoken': '^9.0.2',
            'bcrypt': '^5.1.1',
            'winston': '^3.11.0',
            'zod': '^3.22.4',
            'express-rate-limit': '^7.1.5',
            'swagger-jsdoc': '^6.2.8',
            'swagger-ui-express': '^5.0.0',
            ...databaseDeps
        },
        devDependencies: {
            '@types/express': '^4.17.21',
            '@types/node': '^20.11.5',
            '@types/cors': '^2.8.17',
            '@types/compression': '^1.7.5',
            '@types/jsonwebtoken': '^9.0.5',
            '@types/bcrypt': '^5.0.2',
            '@types/swagger-jsdoc': '^6.0.4',
            '@types/swagger-ui-express': '^4.1.6',
            typescript: '^5.3.3',
            'tsx': '^4.7.0',
            'eslint': '^8.56.0',
            '@typescript-eslint/parser': '^6.19.0',
            '@typescript-eslint/eslint-plugin': '^6.19.0',
            'prettier': '^3.2.4',
            'create-aggain': '^3.0.1',
            ...databaseDevDeps,
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
    const hasDatabase = !!options.database;
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { setupSwagger } from './config/swagger.js';
import { healthRouter } from './routes/health.js';
import { exampleRouter } from './routes/example.js';
${hasDatabase ? `import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/user.js';
import { connectDatabase } from './utils/database.js';` : ''}
import { errorHandler } from './middlewares/error.js';
import { logger } from './utils/logger.js';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

// Middlewares
app.use(cors({ origin: config.cors.origin }));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(limiter);

// Swagger documentation
setupSwagger(app);

// Health check routes
app.use(healthRouter);

// API routes
app.use('/api/example', exampleRouter);
${hasDatabase ? `app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);` : ''}

// Error handling
app.use(errorHandler);

${hasDatabase ? `// Database connection
connectDatabase().then(() => {
  app.listen(config.port, () => {
    logger.info(\`Servidor rodando na porta \${config.port}\`);
    logger.info(\`Documentação disponível em http://localhost:\${config.port}/api-docs\`);
  });
});` : `// Start server
app.listen(config.port, () => {
  logger.info(\`Servidor rodando na porta \${config.port}\`);
  logger.info(\`Documentação disponível em http://localhost:\${config.port}/api-docs\`);
});`}

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
function generateDockerCompose(options) {
    const hasDatabase = !!options.database;
    let databaseService = '';
    if (options.database === 'mongodb') {
        databaseService = `
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=${options.name}
    volumes:
      - mongodb_data:/data/db`;
    }
    else if (options.database === 'postgresql') {
        databaseService = `
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=${options.name}
    volumes:
      - postgres_data:/var/lib/postgresql/data`;
    }
    else if (options.database === 'mysql') {
        databaseService = `
  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=${options.name}
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql`;
    }
    return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "\${PORT:-${options.port}}:${options.port}"
    environment:
      - NODE_ENV=production
    ${hasDatabase ? `depends_on:\n      - ${options.database === 'mongodb' ? 'mongodb' : options.database === 'postgresql' ? 'postgres' : 'mysql'}` : ''}
    volumes:
      - .:/app
      - /app/node_modules
${databaseService}

volumes:${hasDatabase ? `\n  ${options.database === 'mongodb' ? 'mongodb' : options.database === 'postgresql' ? 'postgres' : 'mysql'}_data:` : ''}
`;
}
function generateREADME(options) {
    const hasDatabase = !!options.database;
    return `# ${options.name}

API moderna gerada com Express e TypeScript

## 🚀 Features

- ✅ Express.js com TypeScript
- ✅ Validação de dados com Zod
- ✅ Logging com Winston
- ✅ Documentação automática com Swagger
- ✅ Rate limiting
- ✅ CORS e Helmet para segurança
${hasDatabase ? `- ✅ Integração com ${options.database}\n- ✅ Sistema de autenticação JWT\n- ✅ CRUD completo de usuários` : ''}
- ✅ Error handling customizado
- ✅ Health check endpoints
${options.includeTests ? '- ✅ Testes com Jest e Supertest' : ''}
${options.includeDocker ? '- ✅ Docker e Docker Compose' : ''}

## 📁 Estrutura do Projeto

\`\`\`
${options.name}/
├── src/
│   ├── config/          # Configurações da aplicação
│   │   ├── index.ts     # Config principal
│   │   └── swagger.ts   # Configuração do Swagger
│   ├── controllers/     # Controladores
│   ├── middlewares/     # Middlewares customizados
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
${hasDatabase ? '│   ├── models/          # Modelos do banco de dados\n' : ''}│   ├── utils/           # Utilitários
│   │   ├── errors.ts    # Classes de erro personalizadas
│   │   ├── logger.ts    # Configuração do logger
${hasDatabase ? '│   │   └── database.ts  # Conexão com banco de dados\n' : ''}│   └── index.ts         # Entry point
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de variáveis
├── package.json
└── tsconfig.json
\`\`\`

## 🛠️ Instalação

\`\`\`bash
# Instalar dependências
npm install

${hasDatabase ? `# Configurar variáveis de ambiente\ncp .env.example .env\n# Edite o arquivo .env com suas configurações\n` : ''}
\`\`\`

## 🚀 Uso

\`\`\`bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

${options.includeTests ? `# Testes\nnpm test\n` : ''}${options.includeDocker ? `# Docker\ndocker-compose up\n` : ''}
\`\`\`

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **Swagger UI**: http://localhost:${options.port}/api-docs
- **Health Check**: http://localhost:${options.port}/health
- **Ready Check**: http://localhost:${options.port}/ready

## 🔐 Endpoints

### Health Check
- \`GET /health\` - Status da aplicação
- \`GET /ready\` - Prontidão para receber requisições

### Example API
- \`GET /api/example\` - Listar exemplos
- \`POST /api/example\` - Criar exemplo

${hasDatabase ? `### Authentication
- \`POST /api/auth/register\` - Registrar novo usuário
- \`POST /api/auth/login\` - Fazer login

### Users (Requer autenticação)
- \`GET /api/users\` - Listar usuários
- \`GET /api/users/:id\` - Buscar usuário por ID
- \`PUT /api/users/:id\` - Atualizar usuário
- \`DELETE /api/users/:id\` - Deletar usuário

## 🔑 Autenticação

Para acessar rotas protegidas, inclua o token JWT no header:

\`\`\`
Authorization: Bearer <seu-token>
\`\`\`

Exemplo de login:

\`\`\`bash
curl -X POST http://localhost:${options.port}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'
\`\`\`
` : ''}
## ⚙️ Variáveis de Ambiente

Veja o arquivo \`.env.example\` para todas as variáveis disponíveis.

Principais variáveis:
- \`NODE_ENV\` - Ambiente (development/production)
- \`PORT\` - Porta do servidor
${hasDatabase ? `- \`DATABASE_URL\` ou \`MONGODB_URI\` - URL do banco de dados\n- \`JWT_SECRET\` - Secret para geração de tokens JWT` : ''}

## 🧪 Testes

${options.includeTests ? `\`\`\`bash
npm test
\`\`\`

Para executar com coverage:

\`\`\`bash
npm test -- --coverage
\`\`\`` : 'Testes não foram incluídos neste projeto. Adicione com:\n\n```bash\nnpm install -D jest @types/jest ts-jest supertest @types/supertest\n```'}

## 📝 Linting e Formatação

\`\`\`bash
# Lint
npm run lint

# Format
npm run format
\`\`\`

## 🐳 Docker

${options.includeDocker ? `Build e executar com Docker:

\`\`\`bash
docker-compose up -d
\`\`\`

Parar containers:

\`\`\`bash
docker-compose down
\`\`\`` : 'Docker não foi incluído neste projeto. Use a flag --docker ao gerar o projeto.'}

## 📄 Licença

MIT

## 👤 Autor

Gerado com [create-aggain](https://github.com/seu-usuario/aggain)
`;
}
//# sourceMappingURL=express.js.map