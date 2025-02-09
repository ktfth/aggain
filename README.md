# create-aggain

Um gerador moderno de BFF (Backend for Frontend) com suporte para Express e Koa.

## Características

- ✨ Suporte para Express e Koa
- 🚀 TypeScript por padrão
- 📦 Estrutura moderna de projeto
- 🧪 Testes automatizados
- 🐳 Suporte a Docker
- 🔒 Configurações de segurança
- 📝 Validação de dados
- 🎯 Foco em BFF

## Requisitos

- Node.js >= 18.0.0
- npm >= 7.0.0

## Uso

```bash
# Usando npx (recomendado)
npx create-aggain my-bff -- -f express -p 3000 --typescript --tests

# Ou instalando globalmente
npm install -g create-aggain
create-aggain my-bff -- -f koa -p 3000 --typescript --tests
```

## Opções

- `-f, --framework <framework>` - Framework a ser usado (express|koa)
- `-p, --port <port>` - Porta do servidor (padrão: 3000)
- `-d, --database <database>` - Banco de dados (mongodb|postgresql|mysql)
- `--typescript` - Usar TypeScript (padrão: true)
- `--tests` - Incluir testes (padrão: true)
- `--docker` - Incluir Dockerfile (padrão: false)

## Estrutura do Projeto

```
my-bff/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   └── index.ts
├── tests/
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o projeto
- `npm start` - Inicia o servidor em produção
- `npm test` - Executa os testes
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código

## Contribuindo

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -am 'Adiciona alguma feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Crie um Pull Request

## Licença

ISC
