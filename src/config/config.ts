import * as dotenv from 'dotenv';

dotenv.config();

interface Config {
  PORT: number;
  MONGODB_URI: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_BUCKET: string;
}

const config: Config = {
  PORT: parseInt(process.env.PORT || '8081', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/prex',
  AWS_REGION: process.env.AWS_REGION || 'us-east-2',
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || '',
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || '',
  AWS_BUCKET: process.env.AWS_BUCKET || ''


};

export default config;
