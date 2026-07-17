import { Response } from 'express';
export declare const createRecurringTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const getRecurringTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateRecurringTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const deleteRecurringTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const pauseRecurringTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const resumeRecurringTask: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const listRecurringTasks: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
