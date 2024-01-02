import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: number;
  MONGODB_URI: string;
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '8081', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/prex',
};

export default config;
