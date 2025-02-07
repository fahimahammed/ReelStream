import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import env from '../config/env';
import prisma from '../utils/prismaClient';

export const authOptional = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(); // No token, proceed without authentication
    }

    try {
        const decoded = jwt.verify(
            token,
            env.jwt.secret as string
        ) as JwtPayload;

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true }
        });

        if (user) {
            req.user = { id: user.id, ...decoded }; // Attach user data to request
        }
    } catch (error) {
        console.error('JWT Verification Failed:', error);
    }

    next();
};
