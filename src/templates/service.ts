import { capitalize } from '../utils/string.js';

export interface ServiceOptions {
  name: string;
  methods: {
    name: string;
    params?: {
      name: string;
      type: string;
    }[];
    returnType?: string;
  }[];
}

export function generateServiceTemplate(options: ServiceOptions): string {
  const { name, methods } = options;
  const ServiceName = capitalize(name);
  
  const methodsImplementation = methods
    .map(method => {
      const params = method.params?.map(p => `${p.name}: ${p.type}`).join(', ') || '';
      const returnType = method.returnType ? `: ${method.returnType}` : ': void';
      
      return `  async ${method.name}(${params})${returnType} {
    try {
      // Implementação do método ${method.name}
      throw new Error('Método ${method.name} não implementado');
    } catch (error) {
      logger.error('Erro em ${ServiceName}.${method.name}:', error);
      throw error;
    }
  }`;
    })
    .join('\n\n');

  return `import { logger } from '../utils/logger.js';

export class ${ServiceName}Service {
${methodsImplementation}
}`;
}

export function generateServiceTest(options: ServiceOptions): string {
  const { name, methods } = options;
  const ServiceName = capitalize(name);
  
  const methodTests = methods
    .map(method => `  describe('${method.name}', () => {
    it('deve lançar erro de não implementado', async () => {
      const service = new ${ServiceName}Service();
      await expect(service.${method.name}(${method.params?.map(() => 'undefined').join(', ') || ''}))
        .rejects
        .toThrow('Método ${method.name} não implementado');
    });
  });`)
    .join('\n\n');

  return `import { ${ServiceName}Service } from '../services/${name}.service.js';

describe('${ServiceName}Service', () => {
${methodTests}
});`;
} 