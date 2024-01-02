import bcrypt from 'bcrypt';
import { 
    getUserByUsername,
    createUser
 } from "./userService";

const registerUser = async (username: string, password: string): Promise<string> => {
  try {
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      throw new Error('El nombre de usuario ya está en uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser(username, hashedPassword);

    return 'Usuario registrado exitosamente.';
  } catch (error: any) {
    error.code = 409;
    throw error;
  }
};

const loginUser = async (username: string, password: string): Promise<string> => {
    try {
      const user = await getUserByUsername(username);
  
      if (!user) {
        throw new Error('Credenciales inválidas.');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas.');
      }
  
      return 'Inicio de sesión exitoso.';
    } catch (error: any) {
      error.code = 401;
      throw error;
    }
  };

export { 
  registerUser,
  loginUser
};
