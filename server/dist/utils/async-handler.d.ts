import { Request, Response, NextFunction } from 'express';
export type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const asyncHandler: (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => void;
export default asyncHandler;
