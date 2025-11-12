export interface AuthOptions {
    authType: 'jwt' | 'session';
    userFields?: {
        name: string;
        type: string;
        required?: boolean;
    }[];
}
export declare function generateAuthModel(options: AuthOptions): string;
export declare function generateAuthService(options: AuthOptions): string;
export declare function generateAuthController(options: AuthOptions, framework: 'koa' | 'express'): string;
export declare function generateAuthMiddleware(options: AuthOptions, framework: 'koa' | 'express'): string;
export declare function generateAuthRoutes(options: AuthOptions, framework: 'koa' | 'express'): string;
