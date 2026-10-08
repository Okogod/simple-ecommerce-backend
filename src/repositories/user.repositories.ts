import { prisma } from '../config/config.js';

// Types
import type {
    QueryType,
    UserIdType,
    UpdateUserType
} from '../types/types.js';

import { CustomError } from '../middlewares/middlewares.js';

export const GetAllUsers = async (data: QueryType) => {
    try {
        // If Cursor Was Provided, Get Users From Where Cursor Points And Within The Take Limit
        if (data.cursor) {
            return await prisma.user.findMany({
                take: parseInt(data.limit as string) + 1,
                cursor: { id: data.cursor },
                omit: { createdAt: true, updatedAt: true, password: true },
                orderBy: { createdAt: 'asc' }
            })
        }
        // Return First Provided Users Within The Take Limit
        return await prisma.user.findMany({
            take: parseInt(data.limit as string) + 1,
            omit: { createdAt: true, updatedAt: true, password: true },
            orderBy: { createdAt: 'asc' }
        })
    }catch(err: any){
        if(err.name === "PrismaClientValidationError") throw new CustomError({ status: 400, success: false, message: `limit parameter missing`});
    }
}
export const GetSingleUser = async (data: UserIdType) => {
    // Ge User Whose d Was Provided
    return await prisma.user.findUnique({
        where: {
            id: data.userId
        },
        omit: { createdAt: true, updatedAt: true, password: true }
    })
}
export const UpdateUser = async (params: UpdateUserType) => {
    try {
        // Update Details Of The User Of Whose Id Was Passed If Found, And The Details That Was Provided, Else Throw A User Not Found Error
        await prisma.user.update({
            where: { id: params.id },
            data: params.data
        })
    } catch (err: any) {
        if (err.code === "P2025") throw new CustomError({ status: 404, success: false, message: `no user matched the provided id` });
        throw new CustomError({ status: 500, success: false, message: `internal server error` });
    }
}
