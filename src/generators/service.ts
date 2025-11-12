import { ServiceOptions, generateServiceTemplate, generateServiceTest } from '../templates/service.js';
import { mkdir, writeFile } from 'fs/promises';

import { capitalize } from '../utils/string.js';
import { logger } from '../utils/logger.js';
import path from 'path';

export async function generateServiceFiles(
  options: ServiceOptions,
  includeTests: boolean,
  projectPath: string
): Promise<void> {
  const { name } = options;

  try {
    // Criar diretório de serviços
    await mkdir(path.join(projectPath, 'src', 'services'), { recursive: true });

    // Gerar serviço
    const serviceContent = generateServiceTemplate(options);
    await writeFile(
      path.join(projectPath, 'src', 'services', `${name}.service.ts`),
      serviceContent
    );

    // Gerar testes se solicitado
    if (includeTests) {
      await mkdir(path.join(projectPath, 'src', '__tests__', 'services'), { recursive: true });
      const testContent = generateServiceTest(options);
      await writeFile(
        path.join(projectPath, 'src', '__tests__', 'services', `${name}.service.test.ts`),
        testContent
      );
    }

    logger.info(`Serviço ${name} gerado com sucesso!`);
  } catch (error) {
    logger.error('Erro ao gerar serviço:', error);
    throw error;
  }
} 