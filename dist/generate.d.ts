export interface GenerateOptions {
    type: 'route' | 'controller' | 'model' | 'service' | 'middleware' | 'test';
    name: string;
    path?: string;
    framework?: 'express' | 'koa';
}
export declare function generateResource(options: GenerateOptions): Promise<void>;
/**
 * Gera um conjunto completo de recursos (CRUD)
 */
export declare function generateCrud(name: string, framework?: 'express' | 'koa'): Promise<void>;
