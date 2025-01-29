import { NextFunction, Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import env from '../../config/env';
import { ILoginUserResponse, IRefreshTokenResponse } from './auth.interface';

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


const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.loginUser(req.body);
    const { refreshToken } = result;
    const cookieOptions = {
        secure: env.env === 'production',
        httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    sendResponse<ILoginUserResponse>(res, {
        statusCode: 200,
        success: true,
        message: 'User logged in successfully !',
        data: {
            accessToken: result.accessToken
        },
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    const result = await AuthServices.refreshToken(refreshToken);

    sendResponse<IRefreshTokenResponse>(res, {
        statusCode: 200,
        success: true,
        message: 'Access token generated!',
        data: result,
    });
});

export const AuthController = {
    registerUser,
    loginUser,
    refreshToken
};