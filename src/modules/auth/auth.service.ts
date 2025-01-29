import { User } from "@prisma/client"
import prisma from "../../utils/prismaClient"
import ApiError from "../../errors/ApiError";
import { comparePasswords, hashedPassword } from "./auth.utils";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../utils/jwtHelper";

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

const loginUser = async (payload: { email: string, password: string }): Promise<{ token: string }> => {
    const { email, password } = payload;
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid credentials!");

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) throw new ApiError(StatusCodes.BAD_REQUEST, "Wrong Password!");

    // Generate JWT token
    const token = jwtHelpers.createToken({ id: user.id, email: user.email })

    return { token };
}


export const AuthServices = {
    registerUser,
    loginUser
}