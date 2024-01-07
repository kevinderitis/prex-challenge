import express, { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/jwt';
import { AuthenticatedRequest } from '../models/interfaces/request';
import { HTTP_ERRORS } from '../config/errors';

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(HTTP_ERRORS.UNAUTHORIZED).json({ error: { code: HTTP_ERRORS.UNAUTHORIZED, message: 'Missing token' } });
  }

  try {
    const username = validateToken(token); 
    req.user = username;

    next();
  } catch (error) {
    return res.status(401).json({ error: { code: HTTP_ERRORS.UNAUTHORIZED, message: 'Invalid token' } });
  }
};

export {
    auth
}