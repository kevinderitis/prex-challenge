import jwt from 'jsonwebtoken';

const sign = (username: string): string => {
    const token = jwt.sign({ username }, 'secreto');
    return token;
};

const validateToken = (token: string): string | object => {
    try {
      const username = jwt.verify(token, 'secreto'); 
  
      return username;
    } catch (error: any) {
      throw new Error(`Error al validar el token: ${error.message}`);
    }
  };


export { 
    sign,
    validateToken
  };
  