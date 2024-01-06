import { uploadController } from '../src/controllers/filesController';
import { createFile } from '../src/services/filesService';
import { AuthenticatedRequest, MulterS3File } from '../src/models/interfaces/request';
import { Response } from 'express';


describe('uploadController', () => {
    it('should return a success response when file is uploaded', async () => {
        const req = {
            file: {
                key: '000001-image.jpg',
                location: 'location',
            } as MulterS3File,
            user: {
                username: 'usernametest',
            },
        } as AuthenticatedRequest;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await uploadController(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Archivo subido' });

        expect(createFile).toHaveBeenCalledWith('000001-image.jpg', 'usernametest', 'location');
    });

});
