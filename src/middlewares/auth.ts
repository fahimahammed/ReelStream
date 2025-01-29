import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../utils/catchAsync';
import ApiError from '../errors/ApiError';
import env from '../config/env';
import prisma from '../utils/prismaClient';

export const auth = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new ApiError(
                StatusCodes.UNAUTHORIZED,
                'You are not authorized!'
            );
        }

        const decoded = jwt.verify(
            token,
            env.jwt.secret as string
        ) as JwtPayload;

        const { id } = decoded;

        const user = await prisma.user.findFirst({
            where: { id },
            select: { id: true }
        });

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'This user is not found!'
            );
        }

        req.user = decoded;
        next();
    }
);

