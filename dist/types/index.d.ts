export interface ProjectOptions {
    name: string;
    port: number;
    database?: string;
    typescript: boolean;
    includeTests: boolean;
    includeDocker: boolean;
}
export interface TemplateData {
    projectName: string;
    port: number;
    database?: string;
    hasTypeScript: boolean;
    hasTests: boolean;
    hasDocker: boolean;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
}
export interface GeneratorConfig {
    templateDir: string;
    targetDir: string;
    data: TemplateData;
}
export type Framework = 'express' | 'koa';
export interface RouteConfig {
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    path: string;
    handler: string;
    middlewares?: string[];
    validation?: {
        body?: Record<string, unknown>;
        params?: Record<string, unknown>;
        query?: Record<string, unknown>;
    };
}
