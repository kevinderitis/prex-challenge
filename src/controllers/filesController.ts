import { Response } from 'express';
import { createFile, getFilesByUser, deleteFileById, getFileById, createSharedFile, downloadFileFromS3, revokeAccess } from '../services/filesService';
import { AuthenticatedRequest, MulterS3File } from '../models/interfaces/request';
import { getUserByUsername } from '../services/userService';
import { HTTP_ERRORS, ERROR_MESSAGES } from '../config/errors';
import { HTTP_CODES } from '../config/codes';

const uploadController = async (req: AuthenticatedRequest, res: Response) => {
    const file = req.file as MulterS3File;

    if (!file) {
        return res.status(HTTP_ERRORS.BAD_REQUEST).json({ error: { code: HTTP_ERRORS.BAD_REQUEST, message: 'No file has been uploaded.' } });
    }

    const filename = file.key;
    const username = req.user && typeof req.user.username === 'string' ? req.user.username : '';
    const url = file.location ? file.location : '';

    if (!filename || !username) {
        return res.status(HTTP_ERRORS.UNAUTHORIZED).json({ error: { code: HTTP_ERRORS.UNAUTHORIZED, message: 'Missing filename or file.' } });
    }

    try {
        const result = await createFile(filename, username, url);
        res.status(HTTP_CODES.CREATED).json({ message: 'File uploaded successfully.' });
    } catch (error: any) {

        if (error.message === ERROR_MESSAGES[HTTP_ERRORS.CONFLICT]) {
            res.status(HTTP_ERRORS.CONFLICT).json({ error: { code: HTTP_ERRORS.CONFLICT, message: ERROR_MESSAGES[HTTP_ERRORS.CONFLICT] } });
        } else {
            res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: error.message } });
        }
    }
};


const getUserFilesController = async (req: AuthenticatedRequest, res: Response) => {
    const username = req.user && typeof req.user.username === 'string' ? req.user.username : '';;
    let files = {};

    if (!username) {
        return res.status(HTTP_ERRORS.UNAUTHORIZED).json({ error: { code: HTTP_ERRORS.UNAUTHORIZED, message: 'User not found' } });
    }

    try {
        files = await getFilesByUser(username);
    } catch (error: any) {
        console.error(error);
        res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: error.message } });
    }

    res.status(HTTP_CODES.OK).json({ files });
};

const deleteFileController = async (req: AuthenticatedRequest, res: Response) => {
    const fileId = req.params.id;
    const owner = req.user.username;

    try {
        await deleteFileById(fileId, owner);
        res.status(HTTP_CODES.OK).json({ message: 'File deleted successfully.' });
    } catch (error: any) {
        if (error.message === ERROR_MESSAGES[HTTP_ERRORS.NOT_FOUND]) {
            res.status(HTTP_ERRORS.NOT_FOUND).json({ error: { code: HTTP_ERRORS.NOT_FOUND, message: ERROR_MESSAGES[HTTP_ERRORS.NOT_FOUND] } });
        } else if (error.message === ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN]) {
            res.status(HTTP_ERRORS.FORBIDDEN).json({ error: { code: HTTP_ERRORS.FORBIDDEN, message: ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN] } });
        } else {
            console.error(error);
            res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: 'Error deleting the file.' } });
        }
    }
};


const shareFileController = async (req: AuthenticatedRequest, res: Response) => {
    const fileId = req.params.id;
    const { username } = req.body;
    const owner = req.user.username;

    try {
        const file = await getFileById(fileId);

        if (!file) {
            return res.status(HTTP_ERRORS.NOT_FOUND).json({ error: { code: HTTP_ERRORS.NOT_FOUND, message: 'File not found' } });
        }

        if (file.user !== owner) {
            return res.status(HTTP_ERRORS.FORBIDDEN).json({ error: { code: HTTP_ERRORS.FORBIDDEN, message: ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN] } });
        }

        const sharedWithUser = await getUserByUsername(username);

        if (!sharedWithUser) {
            return res.status(HTTP_ERRORS.UNAUTHORIZED).json({ error: { code: HTTP_ERRORS.UNAUTHORIZED, message: 'User does not exists.' } });
        }

        await createSharedFile(fileId, owner, username);
        return res.status(HTTP_CODES.OK).json({ message: 'File shared successfully.' });
    } catch (error: any) {

        if (error.message === ERROR_MESSAGES[HTTP_ERRORS.NOT_FOUND]) {
            return res.status(HTTP_ERRORS.NOT_FOUND).json({ error: { code: HTTP_ERRORS.NOT_FOUND, message: ERROR_MESSAGES[HTTP_ERRORS.NOT_FOUND] } });
        } else if (error.message === ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN]) {
            return res.status(HTTP_ERRORS.FORBIDDEN).json({ error: { code: HTTP_ERRORS.FORBIDDEN, message: ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN] } });
        } else {
            return res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: 'Error sharing the file.' } });
        }
    }
};


const downloadFileController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const fileId = req.params.id;

        const fileDetails = await getFileById(fileId);

        if (!fileDetails || fileDetails.user !== req.user.username) {
            return res.status(HTTP_ERRORS.FORBIDDEN).json({ error: { code: HTTP_ERRORS.FORBIDDEN, message: ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN] } });
        }

        const fileData = await downloadFileFromS3(fileDetails.filename);

        res.setHeader('Content-Disposition', `attachment; filename=${fileDetails.filename}`);

        res.write(fileData);
        res.end();
    } catch (error: any) {
        res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.INTERNAL_SERVER_ERROR, message: error.message} });
    }
};

const revokeAccessController = async (req: AuthenticatedRequest, res: Response) => {
    const fileId = req.params.id;
    const { username } = req.body;
    const owner = req.user.username;

    try {
        const file = await getFileById(fileId);

        if (!file) {
            return res.status(HTTP_ERRORS.NOT_FOUND).json({ error: { code: HTTP_ERRORS.NOT_FOUND, message: 'File not found.'} });
        }

        if (file.user !== owner) {
            return res.status(HTTP_ERRORS.FORBIDDEN).json({ error: { code: HTTP_ERRORS.FORBIDDEN, message: ERROR_MESSAGES[HTTP_ERRORS.FORBIDDEN]} });
        }

        const userToRevokeAccess = await getUserByUsername(username);

        if (!userToRevokeAccess) {
            return res.status(HTTP_ERRORS.NOT_FOUND).json({ error: { code: HTTP_ERRORS.NOT_FOUND, message: 'User does not exists.'} });
        }

        await revokeAccess(fileId, owner, userToRevokeAccess.username);
        return res.status(HTTP_CODES.OK).json({ message: 'Access was successfully removed' });
    } catch (error: any) {
        return res.status(HTTP_ERRORS.INTERNAL_SERVER_ERROR).json({ error: { code: HTTP_ERRORS.NOT_FOUND, message: error.message} });
    }
};

export {
    uploadController,
    getUserFilesController,
    deleteFileController,
    shareFileController,
    downloadFileController,
    revokeAccessController
};
