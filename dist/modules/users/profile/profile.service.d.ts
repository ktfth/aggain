export declare class ProfileService {
    static create(data: any): Promise<any>;
    static findAll(): Promise<any>;
    static findById(id: string): Promise<any>;
    static update(id: string, data: any): Promise<any>;
    static delete(id: string): Promise<any>;
}
