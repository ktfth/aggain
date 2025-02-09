import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mkdir, writeFile } from 'fs/promises';

import { generateDenoProject } from '../../generators/deno';
import path from 'path';

// Mock dos módulos
jest.mock('fs/promises');
jest.mock('../../utils/logger');

describe('Deno Generator', () => {
  const mockOptions = {
    name: 'test-project',
    port: 3000,
    typescript: true,
    includeTests: true,
    includeDocker: true,
  };

  const expectedFiles = [
    'deno.json',
    'src/main.ts',
    'src/routes/example.ts',
    'src/controllers/example.ts',
    'src/middlewares/error.ts',
    'src/middlewares/validation.ts',
    'src/utils/logger.ts',
    'tests/example_test.ts',
    'README.md'
  ];

  beforeEach(() => {
    // Limpar todos os mocks
    jest.clearAllMocks();
    
    // Mock do mkdir para não criar diretórios reais
    (mkdir as jest.MockedFunction<typeof mkdir>).mockResolvedValue(undefined as never);
    
    // Mock do writeFile para não criar arquivos reais
    (writeFile as jest.MockedFunction<typeof writeFile>).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create project with all files', async () => {
    await generateDenoProject(mockOptions);

    // Verificar se os diretórios foram criados
    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });

    // Verificar se todos os arquivos esperados foram criados
    const writeFileCalls = (writeFile as jest.MockedFunction<typeof writeFile>).mock.calls;
    expectedFiles.forEach(file => {
      const normalizedFile = file.split('/').join(path.sep);
      const fileCreated = writeFileCalls.some(([filePath]) => 
        filePath.toString().endsWith(normalizedFile)
      );
      expect(fileCreated).toBe(true);
    });
  });

  it('should generate valid deno.json', async () => {
    await generateDenoProject(mockOptions);

    const writeFileCalls = (writeFile as jest.MockedFunction<typeof writeFile>).mock.calls;
    const denoJsonCall = writeFileCalls.find(
      ([path]) => typeof path === 'string' && path.endsWith('deno.json')
    );

    expect(denoJsonCall).toBeDefined();
    const [, content] = denoJsonCall || [];
    expect(content).toBeDefined();

    const denoJson = JSON.parse(content as string);

    expect(denoJson.tasks).toBeDefined();
    expect(denoJson.imports).toBeDefined();
    expect(denoJson.imports.oak).toBeDefined();
    expect(denoJson.imports.zod).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Test error');
    (mkdir as jest.MockedFunction<typeof mkdir>).mockRejectedValue(error as never);

    await expect(generateDenoProject(mockOptions)).rejects.toThrow('Test error');
  });

  it('should not create test files when tests are disabled', async () => {
    const optionsWithoutTests = { ...mockOptions, includeTests: false };
    await generateDenoProject(optionsWithoutTests);

    const writeFileCalls = (writeFile as jest.MockedFunction<typeof writeFile>).mock.calls;
    const testFiles = [
      'tests/example_test.ts',
      'src/__tests__',
      'test.ts'
    ];
    
    const testFileCreated = writeFileCalls.some(([filePath]) => 
      testFiles.some(testFile => filePath.toString().endsWith(testFile))
    );
    expect(testFileCreated).toBe(false);
  });
}); 