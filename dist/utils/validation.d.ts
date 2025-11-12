import { z } from 'zod';
export declare function validateProjectName(name: string): string;
export declare function validatePort(port: number): number;
export declare function validateFramework(framework: string): 'express' | 'koa' | 'deno';
export declare function validateDatabase(database?: string): string | undefined;
export declare const userFieldSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    required: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type?: string;
    name?: string;
    required?: boolean;
}, {
    type?: string;
    name?: string;
    required?: boolean;
}>;
export declare function validateAuthType(authType: string): 'jwt' | 'session';
export declare function validateAuthFramework(framework: string): 'express' | 'koa';
export declare function validateAuthOptions(options: {
    authType: 'jwt' | 'session';
    userFields?: z.infer<typeof userFieldSchema>[];
}): {
    authType: 'jwt' | 'session';
    userFields?: z.infer<typeof userFieldSchema>[];
};
