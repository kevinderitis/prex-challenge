import bcrypt from 'bcrypt';
import * as jwt from './jwt'
import { ERROR_MESSAGES, HTTP_ERRORS } from '../config/errors';

import {
  getUserByUsername,
  createUser
} from "./userService";

const registerUser = async (username: string, password: string): Promise<string> => {
  try {
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.CONFLICT]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(username, hashedPassword);

    return 'User registered successfully.';
  } catch (error: any) {
    throw error;
  }
};

const loginUser = async (username: string, password: string): Promise<string> => {
  try {
    const user = await getUserByUsername(username);

    if (!user) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.UNAUTHORIZED]);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.UNAUTHORIZED]);
    }

    const token = jwt.sign(username);

    return token;
  } catch (error: any) {
    throw error;
  }
};

export {
  registerUser,
  loginUser
};
