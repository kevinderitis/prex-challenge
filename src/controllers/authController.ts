import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { HTTP_ERRORS, ERROR_MESSAGES } from '../config/errors';
import { HTTP_CODES } from '../config/codes';


const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(HTTP_ERRORS.BAD_REQUEST).json({ error: { code: HTTP_ERRORS.BAD_REQUEST, message: 'User and password are required.' } });
    }

    const result = await registerUser(username, password);

    res.status(HTTP_CODES.CREATED).json({ message: result });
  } catch (error: any) {

    if (error.message === ERROR_MESSAGES[HTTP_ERRORS.CONFLICT]) {
      res.status(HTTP_ERRORS.CONFLICT).json({ error: { code: HTTP_ERRORS.CONFLICT, message: ERROR_MESSAGES[HTTP_ERRORS.CONFLICT] } });
    } else {
      res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: error.message } });
    }
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(HTTP_ERRORS.BAD_REQUEST).json({ error: { code: HTTP_ERRORS.BAD_REQUEST, message: 'User and password are required.' } });
    }

    const result = await loginUser(username, password);

    res.json({ token: result });
  } catch (error: any) {

    if (error.message === ERROR_MESSAGES[HTTP_ERRORS.UNAUTHORIZED]) {
      res.status(HTTP_ERRORS.UNAUTHORIZED).json({ error: { code: HTTP_ERRORS.UNAUTHORIZED, message: ERROR_MESSAGES[HTTP_ERRORS.UNAUTHORIZED] } });
    } else {
      res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: error.message } });
    }
  }
};


export {
  register,
  login
};
