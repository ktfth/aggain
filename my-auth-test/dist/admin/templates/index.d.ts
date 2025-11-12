interface ComponentOptions {
    name: string;
    type: 'route' | 'controller' | 'service' | 'middleware' | 'model';
    framework: 'express' | 'koa' | 'deno';
    baseDir: string;
    includeTests: boolean;
}
export declare function generateComponent(options: ComponentOptions): Promise<void>;
export {};
