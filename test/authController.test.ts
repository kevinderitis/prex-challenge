import { Request, Response } from 'express';
import { register } from '../src/controllers/authController';
import { registerUser } from '../src/services/authService';
import { login } from '../src/controllers/authController';
import { loginUser } from '../src/services/authService';
import { ERROR_MESSAGES, HTTP_ERRORS } from '../src/config/errors';

jest.mock('../src/services/authService');

describe('Register test', () => {
    it('should return success response when user is registered', async () => {
        const req = {
            body: {
                username: 'testuser',
                password: 'testpassword',
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const mockedResult = 'User successfully registered';
        (registerUser as jest.Mock).mockResolvedValue(mockedResult);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: mockedResult });
        expect(registerUser).toHaveBeenCalledWith('testuser', 'testpassword');
    });

    it('should return bad request when username or password is missing', async () => {
        const req = {
            body: {

            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                code: 400,
                message: 'User and password are required.',
            },
        });

    });

    it('should handle conflict error from register user', async () => {
        const req = {
            body: {
                username: 'existingUser',
                password: 'testpassword',
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const conflictError = new Error(ERROR_MESSAGES[HTTP_ERRORS.CONFLICT]);
        (registerUser as jest.Mock).mockRejectedValue(conflictError);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                code: 409,
                message: ERROR_MESSAGES[HTTP_ERRORS.CONFLICT],
            },
        });
        expect(registerUser).toHaveBeenCalledWith('existingUser', 'testpassword');
    });

    it('should handle internal server error from register user', async () => {
        const req = {
            body: {
                username: 'testuser',
                password: 'testpassword',
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const internalServerError = new Error('Internal server error');
        (registerUser as jest.Mock).mockRejectedValue(internalServerError);

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                code: 500,
                message: 'Internal server error',
            },
        });
        expect(registerUser).toHaveBeenCalledWith('testuser', 'testpassword');
    });
});


describe('Login test', () => {
    it('should return a token when login is successful', async () => {
        const req = {
            body: {
                username: 'testuser',
                password: 'testpassword',
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const mockedToken = 'mockedtoken123';
        (loginUser as jest.Mock).mockResolvedValue(mockedToken);

        await login(req, res);

        expect(res.json).toHaveBeenCalledWith({ token: mockedToken });
        expect(loginUser).toHaveBeenCalledWith('testuser', 'testpassword');
    });

    it('should return bad request when username or password is missing', async () => {
        const req = {
            body: {
             
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                code: 400,
                message: 'User and password are required.',
            },
        });
    });

    it('should handle unauthorized error from loginUser', async () => {
        const req = {
            body: {
                username: 'testuser',
                password: 'testpassword',
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const unauthorizedError = new Error(ERROR_MESSAGES[HTTP_ERRORS.UNAUTHORIZED]);
        (loginUser as jest.Mock).mockRejectedValue(unauthorizedError);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                code: 401,
                message: ERROR_MESSAGES[HTTP_ERRORS.UNAUTHORIZED],
            },
        });
        expect(loginUser).toHaveBeenCalledWith('testuser', 'testpassword');
    });

    it('should handle internal server error from loginUser', async () => {
        const req = {
            body: {
                username: 'testuser',
                password: 'testpassword',
            },
        } as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const internalServerError = new Error('Internal server error');
        (loginUser as jest.Mock).mockRejectedValue(internalServerError);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                code: 500,
                message: 'Internal server error',
            },
        });
        expect(loginUser).toHaveBeenCalledWith('testuser', 'testpassword');
    });
});