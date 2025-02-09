import { mkdir, writeFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import path from 'path';
function generateDenoConfig() {
    return JSON.stringify({
        tasks: {
            start: "deno run --allow-net src/main.ts",
            dev: "deno run --watch --allow-net src/main.ts",
            test: "deno test --allow-net",
            deploy: "deployctl deploy --project=my-bff src/main.ts"
        },
        imports: {
            "oak": "https://deno.land/x/oak@v12.6.1/mod.ts",
            "zod": "https://deno.land/x/zod@v3.22.4/mod.ts",
            "testing/": "https://deno.land/std@0.210.0/testing/",
            "assert": "https://deno.land/std@0.210.0/assert/mod.ts"
        },
        fmt: {
            options: {
                indentWidth: 2,
                lineWidth: 80,
                singleQuote: true
            }
        },
        lint: {
            rules: {
                tags: ["recommended"]
            }
        }
    }, null, 2);
}
function generateMainFile(options) {
    return `import { Application, Router } from "oak";
import { logger } from "./utils/logger.ts";
import { errorHandler } from "./middlewares/error.ts";
import { exampleRouter } from "./routes/example.ts";

const app = new Application();
const router = new Router();
const port = ${options.port};

// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(\`\${ctx.request.method} \${ctx.request.url} - \${ms}ms\`);
});

// Error handling
app.use(errorHandler);

// Routes
router.use("/api", exampleRouter.routes());
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
logger.info(\`Servidor rodando na porta \${port}\`);
await app.listen({ port });`;
}
function generateExampleRoute() {
    return `import { Router } from "oak";
import { ExampleController } from "../controllers/example.ts";
import { validateExample } from "../middlewares/validation.ts";

const router = new Router();
const controller = new ExampleController();

router.get("/example", controller.getExample);
router.post("/example", validateExample, controller.createExample);

export const exampleRouter = router;`;
}
function generateExampleController() {
    return `import { Context } from "oak";

export class ExampleController {
  async getExample(ctx: Context) {
    try {
      ctx.response.body = { message: "Exemplo de resposta GET" };
    } catch (error) {
      throw error;
    }
  }

  async createExample(ctx: Context) {
    try {
      const body = ctx.request.body();
      const data = await body.value;
      
      ctx.response.status = 201;
      ctx.response.body = {
        message: "Exemplo de resposta POST",
        data
      };
    } catch (error) {
      throw error;
    }
  }
}`;
}
function generateErrorMiddleware() {
    return `import { Context, isHttpError } from "oak";
import { logger } from "../utils/logger.ts";

export async function errorHandler(ctx: Context, next: () => Promise<unknown>) {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      ctx.response.status = err.status;
      ctx.response.body = {
        error: {
          message: err.message,
          status: err.status
        }
      };
    } else {
      logger.error("Erro na requisição:", err);
      ctx.response.status = 500;
      ctx.response.body = {
        error: {
          message: "Erro interno do servidor",
          status: 500
        }
      };
    }
  }
}`;
}
function generateValidationMiddleware() {
    return `import { Context } from "oak";
import { z } from "zod";

const exampleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
});

export async function validateExample(ctx: Context, next: () => Promise<unknown>) {
  try {
    const body = ctx.request.body();
    const data = await body.value;
    await exampleSchema.parseAsync(data);
    await next();
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: {
        message: "Dados inválidos",
        details: error.errors || []
      }
    };
  }
}`;
}
function generateLogger() {
    return `class Logger {
  info(message: string, ...args: unknown[]) {
    console.log(\`[INFO] \${message}\`, ...args);
  }

  error(message: string, ...args: unknown[]) {
    console.error(\`[ERROR] \${message}\`, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    console.warn(\`[WARN] \${message}\`, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    console.debug(\`[DEBUG] \${message}\`, ...args);
  }
}

export const logger = new Logger();`;
}
function generateExampleTest() {
    return `import { assertEquals } from "assert";
import { Application } from "oak";
import { exampleRouter } from "../src/routes/example.ts";

Deno.test("GET /api/example", async () => {
  const app = new Application();
  app.use(exampleRouter.routes());

  const response = await app.handle(new Request("http://localhost/api/example"));
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.message, "Exemplo de resposta GET");
});

Deno.test("POST /api/example", async () => {
  const app = new Application();
  app.use(exampleRouter.routes());

  const testData = { name: "Test", email: "test@example.com" };
  const response = await app.handle(
    new Request("http://localhost/api/example", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testData),
    })
  );
  const data = await response.json();

  assertEquals(response.status, 201);
  assertEquals(data.data, testData);
});`;
}
export async function generateDenoProject(options) {
    const projectDir = path.join(process.cwd(), options.name);
    try {
        // Criar diretórios
        await mkdir(projectDir, { recursive: true });
        await mkdir(path.join(projectDir, 'src'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/routes'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/controllers'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/middlewares'), { recursive: true });
        await mkdir(path.join(projectDir, 'src/utils'), { recursive: true });
        if (options.includeTests) {
            await mkdir(path.join(projectDir, 'tests'), { recursive: true });
        }
        // Gerar arquivos de configuração
        await writeFile(path.join(projectDir, 'deno.json'), generateDenoConfig());
        // Gerar arquivos principais
        await writeFile(path.join(projectDir, 'src/main.ts'), generateMainFile(options));
        await writeFile(path.join(projectDir, 'src/routes/example.ts'), generateExampleRoute());
        await writeFile(path.join(projectDir, 'src/controllers/example.ts'), generateExampleController());
        // Gerar middlewares
        await writeFile(path.join(projectDir, 'src/middlewares/error.ts'), generateErrorMiddleware());
        await writeFile(path.join(projectDir, 'src/middlewares/validation.ts'), generateValidationMiddleware());
        // Gerar utilitários
        await writeFile(path.join(projectDir, 'src/utils/logger.ts'), generateLogger());
        if (options.includeTests) {
            await writeFile(path.join(projectDir, 'tests/example_test.ts'), generateExampleTest());
        }
        // Gerar README.md
        await writeFile(path.join(projectDir, 'README.md'), generateReadme(options));
        logger.info(`Projeto Deno gerado com sucesso em ${projectDir}`);
    }
    catch (error) {
        logger.error('Erro ao gerar projeto Deno:', error);
        throw error;
    }
}
function generateReadme(options) {
    return `# ${options.name}

API BFF gerada com Deno e Oak.

## Requisitos

- Deno >= 1.38.0
- [deployctl](https://deno.com/deploy/docs/deployctl) (para deploy)

## Scripts Disponíveis

- \`deno task start\` - Inicia o servidor
- \`deno task dev\` - Inicia o servidor em modo desenvolvimento com hot-reload
- \`deno task test\` - Executa os testes
- \`deno task deploy\` - Faz deploy para o Deno Deploy

## Estrutura do Projeto

\`\`\`
src/
├── routes/
├── controllers/
├── middlewares/
├── utils/
└── main.ts
tests/
└── example_test.ts
deno.json
\`\`\`

## Rotas Disponíveis

- GET /api/example - Retorna um exemplo
- POST /api/example - Cria um exemplo (requer name e email)

## Deploy

1. Crie um projeto no [Deno Deploy](https://deno.com/deploy)
2. Atualize o nome do projeto no \`deno.json\`
3. Execute \`deno task deploy\`

## Licença

ISC
`;
}
//# sourceMappingURL=deno.js.map