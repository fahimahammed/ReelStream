import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import env from '../../config/env';
import { ILoginUserResponse, IRefreshTokenResponse } from './auth.interface';
import { User } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.registerUser(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: 'User registered successfully',
        data: result
    });
})


const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.loginUser(req.body);
    const { refreshToken } = result;
    const cookieOptions = {
        secure: env.env === 'production',
        httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    sendResponse<ILoginUserResponse>(res, {
        statusCode: StatusCodes.OK,
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

const myProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.myProfile(req.user);

    sendResponse<User>(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Access token generated!',
        data: result,
    });
});

export const AuthController = {
    registerUser,
    loginUser,
    refreshToken,
    myProfile
};