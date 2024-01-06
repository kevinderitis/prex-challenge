import express, { Router } from 'express';
import { upload } from '../services/filesService'
import { getUserFilesController, uploadController, deleteFileController, shareFileController, downloadFileController, revokeAccessController } from '../controllers/filesController';

const filesRouter: Router = express.Router();

filesRouter.post('/upload', upload.single('archivo'), uploadController);
filesRouter.get('/', getUserFilesController);
filesRouter.delete('/:id', deleteFileController);
filesRouter.post('/share/:id', shareFileController);
filesRouter.get('/download/:id', downloadFileController)
filesRouter.post('/revoke/:id', revokeAccessController)

export default filesRouter;
