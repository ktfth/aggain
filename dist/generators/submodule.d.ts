export interface SubmoduleOptions {
    moduleName: string;
    submoduleName: string;
    framework: 'koa' | 'express';
    properties: {
        name: string;
        type: string;
        required?: boolean;
    }[];
}
export declare function generateSubmodule(options: SubmoduleOptions, projectPath: string): Promise<void>;
