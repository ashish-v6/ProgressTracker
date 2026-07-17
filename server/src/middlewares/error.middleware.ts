import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any = undefined;

  // Handle Custom App operational errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    if ('errors' in err) {
      errors = err.errors;
    }
  } 
  // Handle Mongoose DB Validation Errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation error';
    errors = Object.keys(err.errors).reduce((acc: any, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  } 
  // Handle Mongoose Cast Errors (Invalid ID lookups)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid identifier format: ${err.value}`;
  }
  // Handle JSON parsing errors
  else if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON request payload';
  }

  // Log non-operational internal errors with stack traces, warning for expected operational ones
  if (statusCode === 500) {
    logger.error(`[Fatal Server Error] ${err.message}`, err);
  } else {
    logger.warn(`[Client Operational Error] ${statusCode} - ${message}`, { errors });
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(errors && { errors })
  });
};

export default errorHandler;
