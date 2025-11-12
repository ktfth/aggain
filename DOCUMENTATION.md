# 📚 Documentação create-aggain

**create-aggain** é um gerador moderno de scaffolding para aplicações web backend, focado em criar protótipos rápidos e APIs prontas para produção.

## 📖 Índice

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Início Rápido](#início-rápido)
- [Frameworks Suportados](#frameworks-suportados)
- [Opções de CLI](#opções-de-cli)
- [Features Implementadas](#features-implementadas)
- [Estrutura de Projeto Gerado](#estrutura-de-projeto-gerado)
- [Integração com Banco de Dados](#integração-com-banco-de-dados)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Documentação da API](#documentação-da-api)
- [Exemplos de Uso](#exemplos-de-uso)
- [Customização](#customização)
- [Melhores Práticas](#melhores-práticas)
- [Troubleshooting](#troubleshooting)
- [Contribuindo](#contribuindo)

---

## 🎯 Visão Geral

O **create-aggain** gera aplicações backend completas com:

- ✅ TypeScript configurado
- ✅ Arquitetura limpa (Controllers → Services → Models)
- ✅ Autenticação JWT
- ✅ Validação de dados com Zod
- ✅ Documentação automática com Swagger
- ✅ Rate limiting
- ✅ Logging estruturado (Winston)
- ✅ Error handling robusto
- ✅ Docker e Docker Compose
- ✅ Testes configurados (Jest + Supertest)

---

## 📦 Instalação

### Uso com npx (Recomendado)

```bash
npx create-aggain meu-projeto
```

### Instalação Global

```bash
npm install -g create-aggain
create-aggain meu-projeto
```

### Instalação Local

```bash
git clone https://github.com/seu-usuario/aggain.git
cd aggain
npm install
npm run build
```

---

## 🚀 Início Rápido

### Exemplo 1: API Simples (sem banco de dados)

```bash
npx create-aggain minha-api -f express
cd minha-api
npm install
npm run dev
```

Acesse: http://localhost:3000/api-docs

### Exemplo 2: API com MongoDB e Docker

```bash
npx create-aggain minha-api \
  -f express \
  -d mongodb \
  --docker \
  --tests

cd minha-api
npm install
docker-compose up -d
npm run dev
```

### Exemplo 3: API com PostgreSQL

```bash
npx create-aggain minha-api \
  -f express \
  -d postgresql \
  -p 4000

cd minha-api
npm install
npm run dev
```

---

## 🎨 Frameworks Suportados

### Express (Padrão)

```bash
create-aggain my-app -f express
```

**Features:**
- Framework mais popular do Node.js
- Middleware robusto
- Grande ecossistema
- Documentação Swagger completa

### Koa

```bash
create-aggain my-app -f koa
```

**Features:**
- Framework moderno e leve
- Async/await nativo
- Context-based
- Middleware elegante

### Deno

```bash
create-aggain my-app -f deno
```

**Features:**
- Runtime moderno (alternativa ao Node.js)
- TypeScript nativo
- Segurança por padrão
- Deploy fácil (Deno Deploy)

---

## ⚙️ Opções de CLI

### Sintaxe

```bash
create-aggain <nome-do-projeto> [opções]
```

### Opções Disponíveis

| Opção | Alias | Valores | Padrão | Descrição |
|-------|-------|---------|--------|-----------|
| `--framework` | `-f` | `express`, `koa`, `deno` | `express` | Framework web |
| `--database` | `-d` | `mongodb`, `postgresql`, `mysql` | - | Banco de dados |
| `--port` | `-p` | `1-65535` | `3000` | Porta do servidor |
| `--typescript` | - | `boolean` | `true` | Usar TypeScript |
| `--tests` | - | `boolean` | `true` | Incluir testes |
| `--docker` | - | `boolean` | `false` | Incluir Docker |

### Exemplos de Combinações

```bash
# API completa com MongoDB
create-aggain my-api -f express -d mongodb --docker --tests

# API com PostgreSQL na porta 4000
create-aggain my-api -f express -d postgresql -p 4000

# API Koa simples
create-aggain my-api -f koa --tests

# API Deno sem testes
create-aggain my-api -f deno --tests false
```

---

## ✨ Features Implementadas

### 1. Variáveis de Ambiente

Todos os projetos incluem arquivos `.env` e `.env.example`:

```env
# Application
NODE_ENV=development
PORT=3000
APP_NAME=minha-api

# Database
MONGODB_URI=mongodb://localhost:27017/minha-api
# ou
DATABASE_URL=postgresql://user:password@localhost:5432/minha-api

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Configuration Management

Arquivo `src/config/index.ts` centraliza todas as configurações:

```typescript
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
};
```

### 3. Error Handling

Classes de erro personalizadas em `src/utils/errors.ts`:

```typescript
// Erro base
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Erros específicos
class BadRequestError extends AppError {} // 400
class UnauthorizedError extends AppError {} // 401
class ForbiddenError extends AppError {} // 403
class NotFoundError extends AppError {} // 404
class ConflictError extends AppError {} // 409
```

**Uso:**

```typescript
throw new NotFoundError('Usuário não encontrado');
throw new UnauthorizedError('Token inválido');
throw new ConflictError('Email já cadastrado');
```

### 4. Validação com Zod

Middleware de validação em `src/middlewares/validation.ts`:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export async function validateUser(req, res, next) {
  try {
    await userSchema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: {
        message: 'Dados inválidos',
        details: error?.errors || []
      }
    });
  }
}
```

### 5. Logging com Winston

Logger configurado em `src/utils/logger.ts`:

```typescript
import winston from 'winston';

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
    }),
  ],
});
```

**Uso:**

```typescript
logger.info('Servidor iniciado');
logger.error('Erro ao conectar ao banco', error);
logger.debug('Dados recebidos', data);
```

### 6. Rate Limiting

Proteção contra DDoS e brute force:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutos
  max: config.rateLimit.max, // 100 requisições
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
});

app.use(limiter);
```

### 7. Health Check Endpoints

Rotas de monitoramento em `src/routes/health.ts`:

```typescript
// GET /health
{
  status: 'OK',
  timestamp: '2024-01-15T10:30:00.000Z',
  uptime: 3600.5,
  environment: 'development'
}

// GET /ready
{
  status: 'READY',
  timestamp: '2024-01-15T10:30:00.000Z'
}
```

**Útil para:**
- Kubernetes liveness probes
- Load balancers health checks
- Monitoring (Prometheus, Datadog)

---

## 🗂️ Estrutura de Projeto Gerado

### Estrutura Completa (com banco de dados)

```
meu-projeto/
├── src/
│   ├── config/                    # Configurações
│   │   ├── index.ts              # Config centralizada
│   │   └── swagger.ts            # Configuração Swagger
│   │
│   ├── controllers/               # Controllers REST
│   │   ├── AuthController.ts     # Login/Register
│   │   ├── UserController.ts     # CRUD de usuários
│   │   └── example.ts            # Controller exemplo
│   │
│   ├── services/                  # Lógica de negócio
│   │   ├── AuthService.ts        # Autenticação
│   │   └── UserService.ts        # Operações de usuário
│   │
│   ├── models/                    # Database models
│   │   └── User.ts               # Model de usuário
│   │
│   ├── routes/                    # Rotas da API
│   │   ├── auth.ts               # Rotas de autenticação
│   │   ├── user.ts               # Rotas de usuários
│   │   ├── health.ts             # Health checks
│   │   └── example.ts            # Rotas exemplo
│   │
│   ├── middlewares/               # Middlewares customizados
│   │   ├── auth.ts               # Autenticação JWT
│   │   ├── validation.ts         # Validação Zod
│   │   └── error.ts              # Error handler
│   │
│   ├── utils/                     # Utilitários
│   │   ├── database.ts           # Conexão DB
│   │   ├── errors.ts             # Classes de erro
│   │   └── logger.ts             # Winston logger
│   │
│   └── index.ts                   # Entry point
│
├── tests/                         # Testes
│   └── example.test.ts
│
├── .env                           # Variáveis de ambiente
├── .env.example                   # Exemplo de .env
├── .gitignore                     # Git ignore
├── package.json                   # Dependências
├── tsconfig.json                  # Config TypeScript
├── Dockerfile                     # Docker (opcional)
├── docker-compose.yml             # Compose (opcional)
└── README.md                      # Documentação
```

### Arquitetura em Camadas

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Middlewares (CORS, Auth)       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Routes (Routing Layer)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Controllers (HTTP Handler)       │
│  - Recebe request                   │
│  - Valida dados                     │
│  - Chama service                    │
│  - Retorna response                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Services (Business Logic)        │
│  - Regras de negócio                │
│  - Validações complexas             │
│  - Operações com Models             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Models (Data Layer)            │
│  - Schemas do banco                 │
│  - Validações de dados              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Database                    │
└─────────────────────────────────────┘
```

---

## 🗄️ Integração com Banco de Dados

### MongoDB (Mongoose)

**Instalação:**
```bash
create-aggain my-api -d mongodb
```

**Model gerado (`src/models/User.ts`):**

```typescript
import mongoose, { Document, Schema } from 'mongoose';

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
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
```

**Conexão (`src/utils/database.ts`):**

```typescript
import mongoose from 'mongoose';

export async function connectDatabase() {
  await mongoose.connect(config.database.url);
  logger.info('MongoDB conectado com sucesso');
}
```

### PostgreSQL/MySQL (TypeORM)

**Instalação:**
```bash
create-aggain my-api -d postgresql
```

**Entity gerada (`src/models/User.ts`):**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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
}
```

**Conexão (`src/utils/database.ts`):**

```typescript
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgresql',
  url: config.database.url,
  synchronize: config.env === 'development',
  logging: config.env === 'development',
  entities: ['src/models/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
});

export async function connectDatabase() {
  await AppDataSource.initialize();
  logger.info('PostgreSQL conectado com sucesso');
}
```

### Configuração do .env

**MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/minha-api
```

**PostgreSQL:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/minha-api
```

**MySQL:**
```env
DATABASE_URL=mysql://user:password@localhost:3306/minha-api
```

---

## 🔐 Sistema de Autenticação

### Arquitetura

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Register   │──────│   AuthService │──────│ UserService  │
└──────────────┘      └──────────────┘      └──────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │  JWT Token   │
                      └──────────────┘
                              │
                              ▼
┌──────────────┐      ┌──────────────┐
│   Login      │──────│   Verify     │
└──────────────┘      └──────────────┘
```

### Endpoints Gerados

#### 1. POST /api/auth/register

Registra um novo usuário.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6",
    "name": "João Silva",
    "email": "joao@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. POST /api/auth/login

Autentica um usuário.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6",
    "name": "João Silva",
    "email": "joao@example.com"
  }
}
```

### Middleware de Autenticação

Em `src/middlewares/auth.ts`:

```typescript
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('Token não fornecido');
  }

  const decoded = jwt.verify(token, config.jwt.secret);
  req.user = decoded;

  next();
}
```

### Usando em Rotas

```typescript
import { authenticate } from '../middlewares/auth.js';

// Rota pública
router.post('/users', validateUser, controller.create);

// Rota protegida
router.get('/users', authenticate, controller.findAll);
router.get('/users/:id', authenticate, controller.findById);
router.put('/users/:id', authenticate, controller.update);
router.delete('/users/:id', authenticate, controller.delete);
```

### Exemplo de Uso (cURL)

```bash
# 1. Registrar
TOKEN=$(curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"senha123"}' \
  | jq -r '.token')

# 2. Usar token em rotas protegidas
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📖 Documentação da API

### Swagger UI

Todos os projetos incluem **Swagger UI** automaticamente em:

```
http://localhost:3000/api-docs
```

### Configuração

Em `src/config/swagger.ts`:

```typescript
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
        url: `http://localhost:${config.port}`,
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
```

### Documentando Endpoints

Use JSDoc comments:

```typescript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 */
router.get('/users', authenticate, controller.findAll);
```

---

## 💻 Exemplos de Uso

### Exemplo 1: CRUD Completo de Produtos

Vamos adicionar um recurso de produtos ao projeto gerado.

**1. Criar Model (`src/models/Product.ts`):**

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);
```

**2. Criar Service (`src/services/ProductService.ts`):**

```typescript
import { Product, IProduct } from '../models/Product.js';
import { NotFoundError } from '../utils/errors.js';

export class ProductService {
  async create(data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.create(data);
    return product;
  }

  async findAll(): Promise<IProduct[]> {
    return await Product.find();
  }

  async findById(id: string): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }
    return product;
  }

  async update(id: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }
    return product;
  }

  async delete(id: string): Promise<void> {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }
  }
}
```

**3. Criar Controller (`src/controllers/ProductController.ts`):**

```typescript
import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService.js';

const productService = new ProductService();

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.findAll();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findById(req.params.id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```

**4. Criar Rotas (`src/routes/product.ts`):**

```typescript
import { Router } from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();
const controller = new ProductController();

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

export const productRouter = router;
```

**5. Registrar no `src/index.ts`:**

```typescript
import { productRouter } from './routes/product.js';

app.use('/api/products', productRouter);
```

### Exemplo 2: Paginação

Adicione paginação ao service:

```typescript
async findAll(page = 1, limit = 10): Promise<{ products: IProduct[], total: number, pages: number }> {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().skip(skip).limit(limit),
    Product.countDocuments()
  ]);

  return {
    products,
    total,
    pages: Math.ceil(total / limit)
  };
}
```

No controller:

```typescript
async findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await productService.findAll(page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
```

---

## 🎨 Customização

### Adicionar Novos Middlewares

**Exemplo: Logging de requisições**

Crie `src/middlewares/requestLogger.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}
```

Adicione em `src/index.ts`:

```typescript
import { requestLogger } from './middlewares/requestLogger.js';

app.use(requestLogger);
```

### Configurar CORS

Em `.env`:

```env
CORS_ORIGIN=https://meu-frontend.com,https://outro-dominio.com
```

Ou diretamente em `src/index.ts`:

```typescript
app.use(cors({
  origin: ['https://meu-frontend.com', 'https://outro-dominio.com'],
  credentials: true,
}));
```

### Customizar Rate Limit por Rota

```typescript
import rateLimit from 'express-rate-limit';

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
});

router.post('/login', strictLimiter, controller.login);
```

---

## 📝 Melhores Práticas

### 1. Nunca commitar .env

O `.gitignore` já está configurado:

```gitignore
.env
*.log
node_modules/
dist/
```

### 2. Usar Variáveis de Ambiente

✅ **Correto:**
```typescript
const secret = config.jwt.secret;
```

❌ **Errado:**
```typescript
const secret = 'minha-chave-secreta';
```

### 3. Validar Sempre os Dados

```typescript
router.post('/users', validateUser, controller.create);
```

### 4. Tratar Erros Apropriadamente

```typescript
try {
  const user = await userService.findById(id);
  res.json(user);
} catch (error) {
  next(error); // Deixa o error middleware tratar
}
```

### 5. Usar DTOs (Data Transfer Objects)

Crie interfaces para dados de entrada/saída:

```typescript
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

### 6. Logs Estruturados

```typescript
logger.info('Usuário criado', { userId: user.id, email: user.email });
logger.error('Erro ao criar usuário', { error: error.message, stack: error.stack });
```

---

## 🔧 Troubleshooting

### Problema: Erro ao conectar ao MongoDB

**Sintoma:**
```
Erro ao conectar ao MongoDB: MongooseServerSelectionError
```

**Solução:**
1. Verifique se o MongoDB está rodando:
   ```bash
   docker ps  # Se usando Docker
   # ou
   sudo systemctl status mongod
   ```

2. Verifique a URL no `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/minha-api
   ```

3. Se usando Docker Compose, suba os containers:
   ```bash
   docker-compose up -d
   ```

### Problema: Erro de TypeScript "Cannot find module"

**Sintoma:**
```
Error: Cannot find module './config/index.js'
```

**Solução:**
1. Compile o TypeScript:
   ```bash
   npm run build
   ```

2. Use extensão `.js` nos imports:
   ```typescript
   import { config } from './config/index.js';
   ```

### Problema: JWT Token inválido

**Sintoma:**
```
UnauthorizedError: Token inválido ou expirado
```

**Solução:**
1. Verifique se está enviando o header correto:
   ```
   Authorization: Bearer <seu-token>
   ```

2. Verifique se o `JWT_SECRET` é o mesmo:
   ```bash
   echo $JWT_SECRET
   ```

3. Gere um novo token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"senha123"}'
   ```

### Problema: Rate limit atingido

**Sintoma:**
```
429 Too Many Requests
```

**Solução:**
1. Ajuste no `.env`:
   ```env
   RATE_LIMIT_MAX_REQUESTS=200
   ```

2. Ou desabilite temporariamente em desenvolvimento:
   ```typescript
   if (config.env === 'development') {
     // Não usar rate limit em dev
   } else {
     app.use(limiter);
   }
   ```

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```

3. Commit suas mudanças:
   ```bash
   git commit -m "feat: adiciona nova feature"
   ```

4. Push para o branch:
   ```bash
   git push origin feature/minha-feature
   ```

5. Abra um Pull Request

### Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Bug fix
- `docs:` Documentação
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas de manutenção

**Exemplos:**
```bash
git commit -m "feat: adiciona suporte a Redis"
git commit -m "fix: corrige erro de autenticação"
git commit -m "docs: atualiza README"
```

---

## 📄 Licença

MIT

---

## 👥 Suporte

- GitHub Issues: https://github.com/seu-usuario/aggain/issues
- Documentação: https://docs.aggain.dev
- Discord: https://discord.gg/aggain

---

**Desenvolvido com ❤️ para a comunidade de desenvolvedores**
