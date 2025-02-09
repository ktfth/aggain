import type { ProjectOptions } from './types/index.js';
import chalk from 'chalk';
import { generateDenoProject } from './generators/deno.js';
import { generateExpressProject } from './generators/express.js';
import { generateKoaProject } from './generators/koa.js';
import { logger } from './utils/logger.js';
import { validateProjectName } from './utils/validation.js';

export default async function main(projectName: string, options: any) {
  try {
    const validatedName = validateProjectName(projectName);
    const projectOptions: ProjectOptions = {
      name: validatedName,
      port: parseInt(options.port, 10),
      database: options.database,
      typescript: options.typescript,
      includeTests: options.tests,
      includeDocker: options.docker,
    };

    logger.info(chalk.blue(`🚀 Iniciando geração do projeto ${validatedName}`));

    if (options.framework === 'express') {
      await generateExpressProject(projectOptions);
    } else if (options.framework === 'koa') {
      await generateKoaProject(projectOptions);
    } else if (options.framework === 'deno') {
      await generateDenoProject(projectOptions);
    } else {
      throw new Error('Framework não suportado');
    }

    logger.info(chalk.green('✨ Projeto gerado com sucesso!'));
    logger.info(`
      ${chalk.yellow('Próximos passos:')}
      1. cd ${validatedName}
      ${options.framework === 'deno' 
        ? `2. deno task dev` 
        : `2. npm install\n      3. npm run dev`}
    `);
  } catch (error) {
    logger.error(chalk.red('Erro ao gerar projeto:'), error);
    process.exit(1);
  }
} 