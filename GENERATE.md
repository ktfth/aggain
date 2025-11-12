# 🔧 Guia de Geração Incremental de Recursos

Este guia detalha como usar o comando `aggain-generate` para adicionar novos recursos ao seu projeto após a inicialização.

## 📋 Índice

- [Introdução](#introdução)
- [Instalação](#instalação)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Exemplos Práticos](#exemplos-práticos)
- [Estrutura Gerada](#estrutura-gerada)
- [Boas Práticas](#boas-práticas)

---

## 🎯 Introdução

O `aggain-generate` permite que você continue desenvolvendo seu projeto após a criação inicial, adicionando recursos de forma consistente e seguindo as melhores práticas.

**Benefícios:**
- ✅ Geração rápida de código boilerplate
- ✅ Consistência na estrutura do código
- ✅ Suporte para Express e Koa
- ✅ Templates prontos com documentação Swagger
- ✅ Testes automáticos

---

## 📦 Instalação

O comando é instalado automaticamente quando você usa `create-aggain`:

```bash
npx create-aggain meu-projeto
cd meu-projeto
npm install

# Agora você pode usar (escolha uma das opções):
npm run generate <tipo> <nome>
# OU
npx aggain-generate <tipo> <nome>
```

**Recomendação:** Use `npm run generate` para facilitar o uso e evitar conflitos de versão.

---

## 📚 Comandos Disponíveis

### 1. Gerar Rota (Route)

Cria um arquivo de rotas com endpoints CRUD básicos.

```bash
npm run generate route <nome>
```

**Exemplo:**
```bash
npm run generate route product
```

**Gera:**
- `src/routes/product.routes.ts`

**Conteúdo:**
- Endpoints GET, POST, PUT, DELETE
- Documentação Swagger
- Integração com controller

---

### 2. Gerar Controller

Cria um controller com métodos CRUD.

```bash
npm run generate controller <nome>
```

**Exemplo:**
```bash
npm run generate controller product
```

**Gera:**
- `src/controllers/product.controller.ts`

**Conteúdo:**
- Métodos: `getAll`, `getById`, `create`, `update`, `remove`
- Tratamento de erros
- Validação de entrada

---

### 3. Gerar Service

Cria uma camada de serviço para lógica de negócio.

```bash
npm run generate service <nome>
```

**Exemplo:**
```bash
npm run generate service product
```

**Gera:**
- `src/services/product.service.ts`

**Conteúdo:**
- Métodos CRUD básicos
- Separação de lógica de negócio
- TODO comments para implementação

---

### 4. Gerar Model

Cria uma interface TypeScript para o modelo de dados.

```bash
npm run generate model <nome>
```

**Exemplo:**
```bash
npm run generate model product
```

**Gera:**
- `src/models/product.model.ts`

**Conteúdo:**
- Interface TypeScript
- Campos básicos (id, createdAt, updatedAt)
- TODO para adicionar campos específicos

---

### 5. Gerar Middleware

Cria um middleware customizado.

```bash
npm run generate middleware <nome>
```

**Exemplo:**
```bash
npm run generate middleware auth
```

**Gera:**
- `src/middlewares/auth.middleware.ts`

**Conteúdo:**
- Estrutura básica de middleware
- Tratamento de erros
- Logger integrado

---

### 6. Gerar Teste

Cria arquivo de testes para um recurso.

```bash
npm run generate test <nome>
```

**Exemplo:**
```bash
npm run generate test product
```

**Gera:**
- `tests/product.test.ts`

**Conteúdo:**
- Testes para endpoints CRUD
- Configuração com Jest e Supertest
- Exemplos de testes

---

### 7. Gerar CRUD Completo

Cria todos os arquivos necessários para um recurso CRUD completo.

```bash
npm run generate crud <nome>
```

**Exemplo:**
```bash
npm run generate crud product
```

**Gera:**
- `src/models/product.model.ts`
- `src/services/product.service.ts`
- `src/controllers/product.controller.ts`
- `src/routes/product.routes.ts`
- `tests/product.test.ts`

---

## 🎨 Exemplos Práticos

### Exemplo 1: Blog API

Criar recursos para um blog:

```bash
cd meu-blog-api
npm install  # Certifique-se de ter as dependências instaladas

# Criar posts
npm run generate crud post

# Criar comentários
npm run generate crud comment

# Criar categorias
npm run generate crud category

# Middleware de autenticação
npm run generate middleware require-auth
```

### Exemplo 2: E-commerce API

Criar recursos para e-commerce:

```bash
cd ecommerce-api
npm install

# Produtos
npm run generate crud product

# Carrinho
npm run generate crud cart

# Pedidos
npm run generate crud order

# Pagamentos (apenas service e controller)
npm run generate service payment
npm run generate controller payment
npm run generate route payment
```

### Exemplo 3: Social Network API

Criar recursos para rede social:

```bash
cd social-api
npm install

# Posts
npm run generate crud post

# Comentários
npm run generate crud comment

# Likes (sem service, lógica simples)
npm run generate route like
npm run generate controller like

# Middleware de moderação
npm run generate middleware content-moderation
```

---

## 📁 Estrutura Gerada

### Para um CRUD completo de "Product":

```
meu-projeto/
├── src/
│   ├── models/
│   │   └── product.model.ts          # Interface do modelo
│   ├── services/
│   │   └── product.service.ts        # Lógica de negócio
│   ├── controllers/
│   │   └── product.controller.ts     # Controllers HTTP
│   └── routes/
│       └── product.routes.ts         # Definição de rotas
└── tests/
    └── product.test.ts               # Testes automatizados
```

### Fluxo de Dados

```
Request → Route → Controller → Service → Model → Database
```

---

## 🎯 Boas Práticas

### 1. Ordem de Geração

Para um novo recurso, siga esta ordem:

```bash
# 1. Gerar estrutura completa
npm run generate crud product

# 2. Customizar model
# Editar src/models/product.model.ts e adicionar campos

# 3. Implementar service
# Editar src/services/product.service.ts e adicionar lógica

# 4. Adicionar validações no controller
# Editar src/controllers/product.controller.ts

# 5. Registrar rota
# Adicionar no src/index.ts
```

### 2. Registrar Rotas

Após gerar uma rota, registre-a no arquivo principal:

**Express:**
```typescript
// src/index.ts
import productRoutes from './routes/product.routes.js';

app.use('/api/products', productRoutes);
```

**Koa:**
```typescript
// src/index.ts
import productRoutes from './routes/product.routes.js';

app.use(productRoutes.routes());
app.use(productRoutes.allowedMethods());
```

### 3. Implementar Models

Para MongoDB/Mongoose:

```typescript
// src/models/product.model.ts
import { Schema, model } from 'mongoose';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<Product>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
}, {
  timestamps: true
});

export const ProductModel = model<Product>('Product', productSchema);
```

Para TypeORM (PostgreSQL/MySQL):

```typescript
// src/models/product.model.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Implementar Services

```typescript
// src/services/product.service.ts
import { ProductModel } from '../models/product.model.js';

class ProductService {
  async findAll() {
    return await ProductModel.find();
  }

  async findById(id: string) {
    return await ProductModel.findById(id);
  }

  async create(data: any) {
    const product = new ProductModel(data);
    return await product.save();
  }

  async update(id: string, data: any) {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true });
  }

  async remove(id: string) {
    await ProductModel.findByIdAndDelete(id);
    return true;
  }
}

export const productService = new ProductService();
```

### 5. Adicionar Validação

Use Zod para validação:

```typescript
// src/middlewares/validation.middleware.ts
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  price: z.number().positive('Preço deve ser positivo'),
  description: z.string().optional(),
});

export async function validateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productSchema.parseAsync(req.body);
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
```

---

## 🔍 Detecção Automática de Framework

O comando detecta automaticamente o framework do projeto:

1. Lê o `package.json`
2. Verifica dependências (`express` ou `koa`)
3. Gera código apropriado

Você também pode especificar manualmente:

```bash
npm run generate route product -- -f express
npm run generate route product -- -f koa
```

**Nota:** O `--` é necessário para passar argumentos adicionais através do npm run.

---

## 🐛 Troubleshooting

### Erro: "Este comando deve ser executado dentro de um projeto aggain"

**Solução:** Certifique-se de estar no diretório raiz do projeto criado com `create-aggain` e que você executou `npm install`.

```bash
cd meu-projeto
npm install
npm run generate crud product
```

### Erro: "Não foi possível detectar o framework"

**Solução:** Especifique o framework manualmente:

```bash
npm run generate route product -- -f express
```

### Erro: "Command not found: aggain-generate"

**Solução:** Execute `npm install` para instalar as dependências do projeto, incluindo o `create-aggain`:

```bash
npm install
npm run generate crud product
```

### Arquivo já existe

O comando não sobrescreve arquivos existentes. Se precisar recriar:

```bash
# Remova o arquivo manualmente
rm src/routes/product.routes.ts

# Execute o comando novamente
npm run generate route product
```

---

## 📝 Contribuindo

Quer adicionar novos templates ou melhorias? Veja nosso [Guia de Contribuição](./DOCUMENTATION.md#contribuindo).

---

## 📄 Licença

MIT © create-aggain

---

<p align="center">
  <strong>⭐ Se este recurso foi útil, deixe uma estrela no projeto!</strong>
</p>
