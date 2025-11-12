import { z } from 'zod';
const projectNameSchema = z
    .string()
    .min(1, 'Nome do projeto é obrigatório')
    .max(214, 'Nome do projeto muito longo')
    .regex(/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/, 'Nome do projeto inválido. Use apenas letras minúsculas, números, hífens e underscores');
export function validateProjectName(name) {
    try {
        return projectNameSchema.parse(name);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Erro de validação: ${error.errors[0].message}`);
        }
        throw new Error('Erro ao validar nome do projeto');
    }
}
export function validatePort(port) {
    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Porta inválida. Use um número entre 1 e 65535');
    }
    return port;
}
export function validateFramework(framework) {
    const validFrameworks = ['express', 'koa', 'deno'];
    if (!validFrameworks.includes(framework)) {
        throw new Error('Framework não suportado. Use "express", "koa" ou "deno"');
    }
    return framework;
}
const databaseSchema = z.union([
    z.literal('mongodb'),
    z.literal('postgresql'),
    z.literal('mysql'),
    z.undefined()
]);
export function validateDatabase(database) {
    try {
        return databaseSchema.parse(database);
    }
    catch (error) {
        throw new Error('Banco de dados não suportado. Use "mongodb", "postgresql" ou "mysql"');
    }
}
// Auth validation schemas and functions
export const userFieldSchema = z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().optional()
});
export function validateAuthType(authType) {
    const validAuthTypes = ['jwt', 'session'];
    if (!validAuthTypes.includes(authType)) {
        throw new Error('Tipo de autenticação não suportado. Use "jwt" ou "session"');
    }
    return authType;
}
export function validateAuthFramework(framework) {
    const validFrameworks = ['express', 'koa'];
    if (!validFrameworks.includes(framework)) {
        throw new Error('Framework não suportado para autenticação. Use "express" ou "koa"');
    }
    return framework;
}
const authOptionsSchema = z.object({
    authType: z.enum(['jwt', 'session']),
    userFields: z.array(userFieldSchema).optional()
});
export function validateAuthOptions(options) {
    try {
        return authOptionsSchema.parse(options);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Erro de validação: ${error.errors[0].message}`);
        }
        throw new Error('Erro ao validar opções de autenticação');
    }
}
//# sourceMappingURL=validation.js.map