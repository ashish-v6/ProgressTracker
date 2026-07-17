import { Response } from 'express';
export declare const startTimer: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const pauseTimer: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const resumeTimer: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const stopTimer: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const getTimerStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
