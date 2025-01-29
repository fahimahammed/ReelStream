import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthServices.registerUser(req.body);
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: 'User registered successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const AuthController = {
    registerUser
};