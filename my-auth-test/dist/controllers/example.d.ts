import { Request, Response, NextFunction } from 'express';
export declare class ExampleController {
    getExample(req: Request, res: Response, next: NextFunction): Promise<void>;
    createExample(req: Request, res: Response, next: NextFunction): Promise<void>;
}
