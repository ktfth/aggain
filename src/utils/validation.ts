import { z } from 'zod';
import { AuthOptions } from '../templates/auth.js';

const projectNameSchema = z
  .string()
  .min(1, 'Nome do projeto é obrigatório')
  .max(214, 'Nome do projeto muito longo')
  .regex(
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
    'Nome do projeto inválido. Use apenas letras minúsculas, números, hífens e underscores'
  );

export function validateProjectName(name: string): string {
  try {
    return projectNameSchema.parse(name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Erro de validação: ${error.errors[0].message}`);
    }
    throw new Error('Erro ao validar nome do projeto');
  }
}

export function validatePort(port: number): number {
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Porta inválida. Use um número entre 1 e 65535');
  }
  return port;
}

export function validateFramework(framework: string): 'express' | 'koa' | 'deno' {
  const validFrameworks = ['express', 'koa', 'deno'] as const;
  if (!validFrameworks.includes(framework as typeof validFrameworks[number])) {
    throw new Error('Framework não suportado. Use "express", "koa" ou "deno"');
  }
  return framework as 'express' | 'koa' | 'deno';
}

const databaseSchema = z.union([
  z.literal('mongodb'),
  z.literal('postgresql'),
  z.literal('mysql'),
  z.undefined()
]);

export function validateDatabase(database?: string): string | undefined {
  try {
    return databaseSchema.parse(database);
  } catch (error) {
    throw new Error('Banco de dados não suportado. Use "mongodb", "postgresql" ou "mysql"');
  }
}

// Auth validation schemas and functions
export const userFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().optional()
});

export function validateAuthType(authType: string): 'jwt' | 'session' {
  const validAuthTypes = ['jwt', 'session'] as const;
  if (!validAuthTypes.includes(authType as typeof validAuthTypes[number])) {
    throw new Error('Tipo de autenticação não suportado. Use "jwt" ou "session"');
  }
  return authType as 'jwt' | 'session';
}

export function validateAuthFramework(framework: string): 'express' | 'koa' {
  const validFrameworks = ['express', 'koa'] as const;
  if (!validFrameworks.includes(framework as typeof validFrameworks[number])) {
    throw new Error('Framework não suportado para autenticação. Use "express" ou "koa"');
  }
  return framework as 'express' | 'koa';
}

const authOptionsSchema = z.object({
  authType: z.enum(['jwt', 'session']),
  userFields: z.array(userFieldSchema).optional()
});

export function validateAuthOptions(options: {
  authType: 'jwt' | 'session';
  userFields?: z.infer<typeof userFieldSchema>[];
}): AuthOptions {
  try {
    return authOptionsSchema.parse(options) as AuthOptions;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Erro de validação: ${error.errors[0].message}`);
    }
    throw new Error('Erro ao validar opções de autenticação');
  }
} 