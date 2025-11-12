# 🚀 create-aggain

<p align="center">
  <strong>Gerador moderno de APIs prontas para produção</strong>
</p>

<p align="center">
  Crie aplicações backend completas com Express, Koa ou Deno em segundos<br>
  TypeScript • JWT Auth • Swagger • Docker • MongoDB/PostgreSQL/MySQL
</p>

---

## ✨ Features

### 🎯 Core
- ✅ **TypeScript** - Type-safe por padrão
- ✅ **Express, Koa ou Deno** - Escolha seu framework
- ✅ **Arquitetura Limpa** - Controllers → Services → Models
- ✅ **Hot Reload** - Desenvolvimento rápido com tsx watch

### 🔐 Autenticação & Segurança
- ✅ **JWT Authentication** - Sistema completo de autenticação
- ✅ **Password Hashing** - bcrypt para senhas
- ✅ **Rate Limiting** - Proteção contra DDoS
- ✅ **CORS & Helmet** - Segurança de headers
- ✅ **Validação com Zod** - Validação de dados robusta

### 🗄️ Banco de Dados
- ✅ **MongoDB** - com Mongoose
- ✅ **PostgreSQL** - com TypeORM
- ✅ **MySQL** - com TypeORM
- ✅ **CRUD Completo** - Templates prontos

### 📚 Developer Experience
- ✅ **Swagger UI** - Documentação automática
- ✅ **Winston Logger** - Logging estruturado
- ✅ **Error Handling** - Classes de erro personalizadas
- ✅ **Health Checks** - Endpoints /health e /ready
- ✅ **Environment Config** - Gerenciamento de .env

### 🐳 DevOps
- ✅ **Docker & Docker Compose** - Containerização pronta
- ✅ **Jest + Supertest** - Suite de testes configurada
- ✅ **ESLint + Prettier** - Code quality
- ✅ **CI/CD Ready** - Pronto para deploy

---

## 🚀 Quick Start

### Instalação Rápida

```bash
# API completa com MongoDB e autenticação
npx create-aggain minha-api -f express -d mongodb --docker

cd minha-api
npm install
npm run dev
```

Acesse:
- **API**: http://localhost:3000
- **Docs**: http://localhost:3000/api-docs
- **Health**: http://localhost:3000/health

### Mais Exemplos

```bash
# API com PostgreSQL
npx create-aggain minha-api -f express -d postgresql

# API simples (sem banco de dados)
npx create-aggain minha-api -f express

# API com Koa e MySQL
npx create-aggain minha-api -f koa -d mysql --docker --tests

# API Deno
npx create-aggain minha-api -f deno
```

---

## 📖 Documentação Completa

**[📚 Leia a Documentação Completa](./DOCUMENTATION.md)** - Guia detalhado com exemplos e melhores práticas

### Conteúdo da Documentação

- 🎯 [Visão Geral](./DOCUMENTATION.md#visão-geral)
- 🚀 [Início Rápido](./DOCUMENTATION.md#início-rápido)
- 🎨 [Frameworks Suportados](./DOCUMENTATION.md#frameworks-suportados)
- ⚙️ [Opções de CLI](./DOCUMENTATION.md#opções-de-cli)
- ✨ [Features Implementadas](./DOCUMENTATION.md#features-implementadas)
- 🗂️ [Estrutura de Projeto](./DOCUMENTATION.md#estrutura-de-projeto-gerado)
- 🗄️ [Banco de Dados](./DOCUMENTATION.md#integração-com-banco-de-dados)
- 🔐 [Autenticação](./DOCUMENTATION.md#sistema-de-autenticação)
- 📖 [Swagger/OpenAPI](./DOCUMENTATION.md#documentação-da-api)
- 💻 [Exemplos Práticos](./DOCUMENTATION.md#exemplos-de-uso)
- 🎨 [Customização](./DOCUMENTATION.md#customização)
- 🔧 [Troubleshooting](./DOCUMENTATION.md#troubleshooting)

---

## 🎯 O que é Gerado?

### Estrutura Completa

```
meu-projeto/
├── src/
│   ├── config/              # Configurações (env, swagger)
│   ├── controllers/         # Controllers REST
│   ├── services/            # Lógica de negócio
│   ├── models/              # Models do banco (quando selecionado)
│   ├── routes/              # Rotas da API
│   ├── middlewares/         # Auth, validation, error
│   ├── utils/               # Logger, errors, database
│   └── index.ts             # Entry point
├── tests/                   # Testes com Jest
├── .env                     # Variáveis de ambiente
├── .env.example             # Template de .env
├── docker-compose.yml       # Docker Compose (opcional)
├── Dockerfile               # Dockerfile (opcional)
└── README.md                # Documentação do projeto
```

### Endpoints Gerados

**Health Checks:**
- `GET /health` - Status da aplicação
- `GET /ready` - Readiness probe

**Auth (quando banco selecionado):**
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login

**Users (quando banco selecionado):**
- `GET /api/users` - Listar usuários (protegido)
- `GET /api/users/:id` - Buscar por ID (protegido)
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar (protegido)
- `DELETE /api/users/:id` - Deletar (protegido)

**Docs:**
- `GET /api-docs` - Swagger UI

---

## 🛠️ Requisitos

- **Node.js** >= 18.0.0
- **npm** >= 7.0.0 ou **yarn** >= 1.22.0
- **Docker** (opcional, para desenvolvimento com containers)

---

## ⚙️ Opções de CLI

```bash
create-aggain <nome-do-projeto> [opções]
```

| Opção | Alias | Valores | Padrão | Descrição |
|-------|-------|---------|--------|-----------|
| `--framework` | `-f` | `express`, `koa`, `deno` | `express` | Framework web |
| `--database` | `-d` | `mongodb`, `postgresql`, `mysql` | - | Banco de dados |
| `--port` | `-p` | `1-65535` | `3000` | Porta do servidor |
| `--typescript` | - | `boolean` | `true` | Usar TypeScript |
| `--tests` | - | `boolean` | `true` | Incluir testes |
| `--docker` | - | `boolean` | `false` | Incluir Docker |

---

## 📦 Stack Tecnológica

### Backend
- **Express.js** / **Koa** / **Deno** - Framework web
- **TypeScript** - Type safety
- **Zod** - Validação de schema
- **Winston** - Logging

### Database
- **Mongoose** - MongoDB ODM
- **TypeORM** - PostgreSQL/MySQL ORM
- **bcrypt** - Password hashing

### Security
- **jsonwebtoken** - JWT authentication
- **helmet** - Security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting

### DevTools
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **ESLint** - Linting
- **Prettier** - Code formatting
- **tsx** - TypeScript execution

### Docs
- **Swagger JSDoc** - OpenAPI generation
- **Swagger UI Express** - Interactive API docs

---

## 💡 Casos de Uso

- ✅ **MVPs e Protótipos** - Start rápido com estrutura profissional
- ✅ **APIs REST** - Backend para aplicações web/mobile
- ✅ **Microserviços** - Serviços isolados e escaláveis
- ✅ **BFF (Backend for Frontend)** - Camada entre frontend e serviços
- ✅ **Hackathons** - Setup rápido para competições
- ✅ **Aprendizado** - Estrutura de referência para estudos

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja nosso [Guia de Contribuição](./DOCUMENTATION.md#contribuindo).

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para o branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Convenções

- Usamos [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` para novas features
- `fix:` para correções
- `docs:` para documentação

---

## 📊 Status do Projeto

- ✅ Express Generator - **Completo**
- ✅ MongoDB Integration - **Completo**
- ✅ PostgreSQL Integration - **Completo**
- ✅ MySQL Integration - **Completo**
- ✅ JWT Authentication - **Completo**
- ✅ Swagger Documentation - **Completo**
- ⚠️ Koa Generator - **Parcial**
- ⚠️ Deno Generator - **Parcial**

---

## 📝 Exemplos Reais

### Exemplo 1: E-commerce API

```bash
npx create-aggain ecommerce-api \
  -f express \
  -d mongodb \
  --docker \
  --tests

cd ecommerce-api
npm install
docker-compose up -d
npm run dev
```

### Exemplo 2: Blog API

```bash
npx create-aggain blog-api \
  -f express \
  -d postgresql \
  -p 4000

cd blog-api
npm install
npm run dev
```

### Exemplo 3: Auth Service

```bash
npx create-aggain auth-service \
  -f koa \
  -d mongodb \
  --docker

cd auth-service
npm install
docker-compose up -d
npm run dev
```

---

## 🌟 Showcase

Projetos criados com **create-aggain**:

- 🏪 **E-commerce Backend** - API completa para loja online
- 📱 **Social Network API** - Backend para rede social
- 📚 **Learning Platform** - API de plataforma educacional
- 💬 **Chat Service** - Serviço de mensagens em tempo real

> Quer adicionar seu projeto aqui? Abra uma issue!

---

## 📄 Licença

MIT © create-aggain

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ para a comunidade de desenvolvedores

---

<p align="center">
  <strong>⭐ Se este projeto foi útil, deixe uma estrela!</strong>
</p>

<p align="center">
  <a href="./DOCUMENTATION.md">📚 Documentação</a> •
  <a href="https://github.com/seu-usuario/aggain/issues">🐛 Issues</a> •
  <a href="https://github.com/seu-usuario/aggain/pulls">🔀 Pull Requests</a>
</p>
