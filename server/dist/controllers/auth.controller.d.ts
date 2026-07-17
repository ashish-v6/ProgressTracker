import { Response } from 'express';
export declare const register: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const login: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const logout: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const refresh: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
export declare const getMe: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
