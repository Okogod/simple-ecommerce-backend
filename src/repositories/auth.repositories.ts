import { prisma } from '../config/config.js';

// Types
import type { 
    UserRegisterType, 
    GetUserType,
    ChangePasswordType 
} from '../types/types.js';

import { CustomError } from '../middlewares/middlewares.js';

export const RegisterUser = async (data: UserRegisterType) => {
    try {
        // Register User If User Wth Mail Doesn't Exists, If Not Throw Conflict Error
        await prisma.user.create({
            data: { firstname: data.firstname, lastname: data.lastname, email: data.email, password: data.password, role: data.role?.toUpperCase() as "ADMIN" | "USER" }
        })
    } catch (err: any) {
        if (err.code === "P2002") throw new CustomError({ status: 409, success: false, message: "user with this email already exist" });
        throw new CustomError({ status: 500, success: false, message: "internal server error" });
    }
}
export const GetUserByEmailOrId = async (data: GetUserType) => {
    // Get User By Id If Id Parameter Was Provided
    if (data.id) return await prisma.user.findUnique({ where: { id: data.id }, omit: { createdAt: true, updatedAt: true, } });
    // Get user By Email If Id Parameter Wasn't Provded
    return await prisma.user.findUnique({ where: { email: data.email as string }, omit: { createdAt: true, updatedAt: true, } });
}
export const ChangePassword = async (params: ChangePasswordType) => {
    try {
        // Change The User's Password Whose Id Was Provided
        await prisma.user.update({
            where: { id: params.id },
            data: params.data
        })
    } catch (err: any) {
        if (err.code === "P2025") throw new CustomError({ status: 404, success: false, message: `no user matched the provided id` });
        throw new CustomError({ status: 500, success: false, message: `iternal server error`});
    }
}

