export interface CrudOptions {
    entityName: string;
    properties: {
        name: string;
        type: string;
        required?: boolean;
    }[];
}
export declare function generateKoaController(options: CrudOptions): string;
export declare function generateExpressController(options: CrudOptions): string;
export declare function generateModel(options: CrudOptions): string;
export declare function generateKoaRoutes(options: CrudOptions): string;
export declare function generateExpressRoutes(options: CrudOptions): string;
