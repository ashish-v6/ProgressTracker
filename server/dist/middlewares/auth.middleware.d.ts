import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
export declare const protect: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export default protect;
