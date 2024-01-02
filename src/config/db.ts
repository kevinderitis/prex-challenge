import mongoose from 'mongoose';
import config from './config';

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Conectado a la base de datos MongoDB');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error);
  }
};

export default connectToDatabase;
