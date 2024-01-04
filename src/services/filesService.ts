import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { FileModel, IFile } from '../models/filesModel';
import {  SharedFileModel, ISharedFile } from '../models/sharedFilesModel'

const s3 = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: 'AKIA6ODU2W55O6VIFFMU',
    secretAccessKey: '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',
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'prex-challenge',
    key: (req: any, file: any, cb: any) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

const deleteObjectFromS3 = async (objectKey: string): Promise<void> => {
  try {
    const deleteParams = {
      Bucket: 'prex-challenge',
      Key: objectKey,
    };

    await s3.send(new DeleteObjectCommand(deleteParams));

    console.log(`Objeto eliminado correctamente: ${objectKey}`);
  } catch (error) {
    console.error('Error al eliminar el objeto:', error);
    throw error;
  }
};

const createFile = async (filename: string, user: string, url: string): Promise<IFile> => {
  try {
    const file = new FileModel({
      filename,
      user,
      url
    });

    const savedFile = await file.save();

    return savedFile;
  } catch (error) {
    console.error('Error al guardar el archivo en la base de datos:', error);
    throw error;
  }
};

const getFileById = async (fileId: string): Promise<IFile | null> => {
  try {
    const file = await FileModel.findById(fileId);

    return file;
  } catch (error) {
    console.error('Error al obtener el archivo por ID:', error);
    throw error;
  }
};

const getFilesByUser = async (username: string): Promise<IFile[]> => {
  try {
    const files = await FileModel.find({ user: username });
    return files;
  } catch (error) {
    console.error('Error al obtener archivos por usuario:', error);
    throw error;
  }
};

const deleteFileById = async (fileId: string): Promise<void> => {
  try {
    const file = await getFileById(fileId)

    if (!file) {
      throw new Error('Archivo no encontrado');
    }

    await deleteObjectFromS3(file.filename);
    const deletedFile = await FileModel.findByIdAndDelete(fileId);

    if (!deletedFile) {
      throw new Error('Archivo no encontrado');
    }
  } catch (error) {
    console.error('Error al eliminar el archivo por ID:', error);
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
    console.error('Error al compartir archivo:', error);
    throw error;
  }
};

export {
  upload,
  createFile,
  deleteFileById,
  getFilesByUser,
  getFileById,
  createSharedFile
};
