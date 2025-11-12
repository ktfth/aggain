export interface ServiceOptions {
    name: string;
    methods: {
        name: string;
        params?: {
            name: string;
            type: string;
        }[];
        returnType?: string;
    }[];
}
export declare function generateServiceTemplate(options: ServiceOptions): string;
export declare function generateServiceTest(options: ServiceOptions): string;
