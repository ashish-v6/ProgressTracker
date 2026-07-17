import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';
import { AuthenticatedRequest } from '../types/express';

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Check Authorization header for Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookie check if access token is also stored in cookie
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new UnauthorizedError('Not authorized. Access token is missing.');
    }

    // Verify JWT Access Token
    const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret_12345';
    const decoded = jwt.verify(token, secret) as { userId: string };

    // Attach decoded user context to request
    req.user = {
      id: decoded.userId
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Access token has expired'));
    } else {
      next(new UnauthorizedError('Not authorized. Token is invalid.'));
    }
  }
};

export default protect;
