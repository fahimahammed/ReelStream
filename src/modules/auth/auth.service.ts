import { User } from "@prisma/client"
import prisma from "../../utils/prismaClient"
import ApiError from "../../errors/ApiError";
import { hashedPassword } from "./auth.utils";

const registerUser = async (payload: User): Promise<Partial<User>> => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });

    if (existingUser) throw new ApiError(403, "Email already in use!")

    payload.password = await hashedPassword(payload.password);

    const user = await prisma.user.create({
        data: payload,
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return user;
}

export const AuthServices = {
    registerUser
}