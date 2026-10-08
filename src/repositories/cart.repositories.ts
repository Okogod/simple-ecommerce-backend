import { prisma } from '../config/config.js';

// Types
import type {
    GetCartItemType,
    AddCartItemType,
    CartItemIdType,
    GetAllCartItemsType,
    UpdateCartItemType,
    DeleteCartItemType
} from '../types/types.js';

import { CustomError } from '../middlewares/middlewares.js';

export const CheckIfCartItemExists = async (data: GetCartItemType) => {
    return await prisma.cartItems.findFirst({
        where: { userId: data.userId, productId: data.productId }
    })
}
export const AddCartItem = async (data: AddCartItemType) => {
    await prisma.cartItems.create({
        data: { userId: data.userId, productId: data.productId, quantity: data.data.quantity }
    })
}
export const GetCartItem = async (data: CartItemIdType) => {
    return await prisma.cartItems.findUnique({
        where: {
            id: data.cartId
        },
        include: { product: { select: { name: true, price: true, } } },
        omit: { createdAt: true, updatedAt: true }
    })
}
export const GetAllCartItems = async (data: GetAllCartItemsType) => {
    try {
        if (data.query.cursor) {
            return await prisma.cartItems.findMany({
                where: { userId: data.userId.userId },
                include: { product: { select: { name: true, price: true, } } },
                take: parseInt(data.query.limit as string) + 1,
                cursor: { id: data.query.cursor },
                omit: { createdAt: true, updatedAt: true },
                orderBy: { createdAt: 'asc' }
            })
        }
        return await prisma.cartItems.findMany({
            where: { userId: data.userId.userId },
            include: { product: { select: { name: true, price: true, } } },
            take: parseInt(data.query.limit as string) + 1,
            omit: { createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'asc' }
        })
    }
    catch (err: any) {
        if (err.name === "PrismaClientValidationError") throw new CustomError({ status: 400, success: false, message: `limit parameter missing` });
        throw new CustomError({ status: 500, success: false, message: err.message });
    }
}
export const UpdateCartItem = async (data: UpdateCartItemType) => {
    try {
        await prisma.cartItems.update({
            where: { id: data.cartId },
            data: { quantity: data.quantity }
        })
    } catch (err: any) {
        if (err.code === "P2025") throw new CustomError({ status: 404, success: false, message: `no cart item matched the provided id` });
        throw new CustomError({ status: 500, success: false, message: `internal server error` });
    }
}
export const DeleteCartItem = async (data: DeleteCartItemType) => {
    await prisma.cartItems.delete({
        where: { id: data.cartId, userId: data.userId }
    })
}