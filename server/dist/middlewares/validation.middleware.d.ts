import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
interface ValidationSchema {
    body?: AnyZodObject;
    query?: AnyZodObject;
    params?: AnyZodObject;
}
export declare const validate: (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default validate;
