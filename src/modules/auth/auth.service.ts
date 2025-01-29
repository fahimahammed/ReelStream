import { User } from "@prisma/client"
import prisma from "../../utils/prismaClient"
import ApiError from "../../errors/ApiError";
import { comparePasswords, hashedPassword } from "./auth.utils";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../utils/jwtHelper";
import { ILoginUser, ILoginUserResponse } from "./auth.interface";
import env from "../../config/env";
import { Secret } from "jsonwebtoken";

const registerUser = async (payload: User): Promise<Partial<User>> => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });

    if (existingUser) throw new ApiError(StatusCodes.BAD_REQUEST, "Email already in use!")

    payload.password = await hashedPassword(payload.password);

    const user = await prisma.user.create({
        data: payload,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;
}

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
    const { email, password } = payload;
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid credentials!");

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) throw new ApiError(StatusCodes.BAD_REQUEST, "Wrong Password!");

    const accessToken = jwtHelpers.createToken(
        { id: user.id, email: user.email },
        env.jwt.secret as Secret,
        env.jwt.expires_in as string
    )

    const refreshToken = jwtHelpers.createToken(
        { id: user.id, email: user.email },
        env.jwt.refresh_secret as Secret,
        env.jwt.refresh_expires_in as string
    );

    return {
        accessToken,
        refreshToken
    };
};

// const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
//     //verify token
//     // invalid token - synchronous
//     let verifiedToken = null;
//     try {
//         verifiedToken = jwtHelpers.verifyToken(
//             token,
//             config.jwt.refresh_secret as Secret
//         );
//     } catch (err) {
//         throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
//     }

//     const { userId } = verifiedToken;

//     const isUserExist = await prisma.user.findUnique({
//         where: {
//             id: userId,
//             status: UserStatus.ACTIVE
//         }
//     });
//     if (!isUserExist) {
//         throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
//     }

//     const newAccessToken = jwtHelpers.createToken(
//         {
//             userId: isUserExist.id,
//             role: isUserExist.role,
//         },
//         config.jwt.secret as Secret,
//         config.jwt.expires_in as string
//     );

//     return {
//         accessToken: newAccessToken,
//     };
// };


export const AuthServices = {
    registerUser,
    loginUser
}