import express, { Request } from 'express';

interface AuthenticatedRequest extends Request {
    user?: any;
  }

  interface MulterS3File extends Express.Multer.File {
    key?: string;
    location?: string;
  }

export {
    AuthenticatedRequest,
    MulterS3File
}