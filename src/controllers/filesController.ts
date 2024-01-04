import { Response } from 'express';
import { createFile, getFilesByUser, deleteFileById, getFileById, createSharedFile } from '../services/filesService';
import { AuthenticatedRequest, MulterS3File } from '../models/interfaces/request';
import { getUserByUsername } from '../services/userService';

const uploadController = async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file as MulterS3File;

    if (!file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const filename = file.key;
    const username = req.user && typeof req.user.username === 'string' ? req.user.username : '';;
    const url = file.location ? file.location : '';

    if (!filename || !username) {
        return res.status(401).json({ message: 'Falta nombre o archivo' });
    }

    try {
        const result = await createFile(filename, username, url);
    } catch (error) {
        console.error(error);
        res.status(501).json({ error: 'Error al crear el archivo' });
    }
    res.status(201).json({ message: 'Archivo subido' });
};

const getUserFilesController = async (req: AuthenticatedRequest, res: Response) => {
    const username = req.user && typeof req.user.username === 'string' ? req.user.username : '';;
    let files = {};

    if (!username) {
        return res.status(401).json({ message: 'Error al obtener usuario' });
    }

    try {
        files = await getFilesByUser(username);
    } catch (error) {
        console.error(error);
        res.status(501).json({ error: 'Error al obtener lista de archivos' });
    }

    res.status(201).json({ files });
};

const deleteFileController = async (req: AuthenticatedRequest, res: Response) => {
    const fileId = req.params.id;

    try {
        await deleteFileById(fileId);
        res.status(200).json({ message: 'Archivo eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el archivo' });
    }
}

const shareFileController = async (req: AuthenticatedRequest, res: Response) => {
    const fileId = req.params.id;
    const { sharedWith } = req.body;
    const owner = req.user.username;

    try {
        const file = await getFileById(fileId);

        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        if (file.user !== owner) {
            return res.status(403).json({ message: 'No tienes permisos para compartir este archivo' });
        }

        const sharedWithUser = await getUserByUsername(sharedWith);

        if (!sharedWithUser) {
            return res.status(401).json({ message: 'Usuario inexistente' });
        }

        await createSharedFile(fileId, owner, sharedWith);
        return res.status(200).json({ message: 'Archivo compartido exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error al compartir el archivo' });
    }
};


export {
    uploadController,
    getUserFilesController,
    deleteFileController,
    shareFileController
};
