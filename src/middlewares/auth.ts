import express, { Request, Response, NextFunction } from 'express';
import { validateToken } from '../services/jwt';
import { AuthenticatedRequest } from '../models/interfaces/request';

const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const username = validateToken(token); 
    req.user = username;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export {
    auth
}