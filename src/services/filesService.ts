import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import config from '../config/config';
import { FileModel, IFile } from '../models/filesModel';
import { SharedFileModel, ISharedFile, FileQueriesResult } from '../models/sharedFilesModel'
import { Readable } from 'stream';
import { HTTP_ERRORS, ERROR_MESSAGES } from '../config/errors';

const s3 = new S3Client({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY,
    secretAccessKey: config.AWS_SECRET_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.AWS_BUCKET,
    key: (req: any, file: any, cb: any) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

const deleteObjectFromS3 = async (objectKey: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: config.AWS_BUCKET,
      Key: objectKey,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

  } catch (error) {
    throw error;
  }
};

const createFile = async (filename: string, user: string, url: string): Promise<IFile> => {
  try {
    const file = new FileModel({
      filename,
      user,
      url,
    });

    const savedFile = await file.save();

    return savedFile;
  } catch (error: any) {
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.CONFLICT]);;
    }
    throw error;
  }
};


const getFileById = async (fileId: string): Promise<IFile | null> => {
  try {
    const file = await FileModel.findById(fileId);

    return file;
  } catch (error) {
    throw error;
  }
};

const getFilesByUser = async (username: string): Promise<FileQueriesResult> => {
  try {
    const myFiles = await FileModel.find({ user: username });
    const sharedWithMe = await SharedFileModel.find({ sharedWith: username })

    const files = {
      myFiles,
      sharedWithMe
    };

    return files;
  } catch (error) {
    throw error;
  }
};

const deleteFileById = async (fileId: string, owner: string): Promise<void> => {
  try {
    const file = await getFileById(fileId);

    if (!file) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.NOT_FOUND]);
    }

    if (file.user !== owner) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN]);
    }

    await deleteObjectFromS3(file.filename);

    const deletedFile = await FileModel.findByIdAndDelete(fileId);

    if (!deletedFile) {
      throw new Error(ERROR_MESSAGES[HTTP_ERRORS.INTERNAL_SERVER_ERROR]);
    }
  } catch (error) {
    throw error;
  }
};



const createSharedFile = async (fileId: string, owner: string, sharedWith: string): Promise<ISharedFile> => {
  try {
    const sharedFile = new SharedFileModel({
      fileId,
      owner,
      sharedWith,
    });

    await sharedFile.save();

    return sharedFile;
  } catch (error) {
    throw error;
  }
};

const downloadFileFromS3 = async (key: string): Promise<Buffer> => {
  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: config.AWS_BUCKET,
      Key: key,
    });

    const { Body } = await s3.send(getObjectCommand);

    if (Body instanceof Readable) {
      const chunks: Uint8Array[] = [];
      for await (const chunk of Body) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    }

    throw new Error('The object body is not a Readable type');
  } catch (error) {
    throw error;
  }
};

const deleteSharedFile = async (fileId: string, user: string): Promise<void> => {
  try {
    const deletedFile = await SharedFileModel.deleteOne({ fileId, sharedWith: user });

    if (deletedFile.deletedCount === 0) {
      throw new Error('No shared file found to delete in s3');
    }
  } catch (error) {
    throw error;
  }
};


const revokeAccess = async (fileId: string, owner: string, user: string): Promise<void> => {
  try {
    const file = await getFileById(fileId)

    if (!file) {
      throw new Error('File not found');
    }

    if (file.user !== owner) {
      throw new Error('User without permission');
    }

    await deleteSharedFile(fileId, user);

  } catch (error) {
    throw error;
  }
};

export {
  upload,
  createFile,
  deleteFileById,
  getFilesByUser,
  getFileById,
  createSharedFile,
  downloadFileFromS3,
  revokeAccess
};
