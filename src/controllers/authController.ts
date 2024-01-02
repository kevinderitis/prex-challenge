import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';


const register = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña.' });
      }

      const result = await registerUser(username, password);

      res.status(201).json({ message: result });
    } catch (error: any) {
      console.error(error);
      res.status(error.code).json({ error: error.message });
    }
  };

  const login = async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Se requieren nombre de usuario y contraseña.' });
      }

      const result = await loginUser(username, password);

      res.json({ message: result });
    } catch (error: any) {
      console.error(error);
      res.status(error.code).json({ error: error.message });
    }
  };


export {
  register,
  login
};
