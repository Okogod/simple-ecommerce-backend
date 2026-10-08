import { prisma } from "../config/config.js";

// Types
import type {
    UserIdType,
    ProcessOrderType,
    UpdateOrderStatusType,
    QueryType,
    GetUserOrdersType
} from "../types/types.js";

import { CustomError } from "../middlewares/middlewares.js";

export const CreateOrder = async (data: UserIdType) => {
    const { totalAmount, orderId } = await prisma.$transaction(async tx => {
        // Get All Cart Items That Belongs To The User
        const userCartItems = await tx.cartItems.findMany({
            where: { userId: data.userId },
            include: { product: { select: { name: true, price: true, quantity: true } } },
            omit: { createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'asc' }
        })
        // Filter All Cart Items To Find Which Product Quantity Exceeds The The Crt Item Quantity And Notify The User If Any
        if (userCartItems.filter(cartItem => cartItem.quantity > cartItem.product.quantity).length > 0) throw new CustomError({ status: 422, success: false, message: `some cart item quantity exceed the available product quantity` });
        // Get The Total Amount From The Cart Items
        const totalAmount = userCartItems.map(cartItems => cartItems.quantity * cartItems.product.price).reduce((a, b) => a + b, 0);
        // Create An Order And Return The Order Id
        const { id } = await tx.order.create({
            data: { userId: data.userId, totalAmount }
        })
        // Create A LIst For All Order Items From Cart Items
        const orderItemsData = await userCartItems.map(cartItem => {
            return {
                orderId: id,
                productId: cartItem.productId,
                quantity: cartItem.quantity,
                cartItemId: cartItem.id
            }
        })
        // Add The Order Items To The Order Items Database
        await tx.orderItems.createMany({
            data: orderItemsData
        })
        // Return TotalAmount And OrderId
        return { totalAmount, orderId: id }
    })
    return { totalAmount, orderId };
}
export const ProcessOrder = async (params: ProcessOrderType) => {
    try {
        // Check If User Balance Is Equal Or Greater The Total Amount
        if ((params.balance as number) < (params.data?.totalAmount as number)) throw new CustomError({ status: 402, success: false, message: `insufficient funds` });
        await prisma.$transaction(async tx => {
            // Get All User Order Items
            const orderItems = await tx.orderItems.findMany({
                where: { orderId: params.data?.orderId as string },
                include: {
                    product: {
                        select: {
                            id: true,
                            quantity: true
                        }
                    },
                    order: {
                        select: {
                            userId: true
                        }
                    }
                }
            })
            // Update The Prodcut Quantities
            for (const product of orderItems) {
                await tx.product.update({
                    where: {
                        id: product.productId
                    },
                    data: { quantity: product.product.quantity - product.quantity }
                })
            }
            // delete All Cart Items That Belongs To The User
            for (const items of orderItems) {
                await tx.cartItems.delete({
                    where: {
                        id: items.cartItemId,
                        userId: items.order.userId
                    },
                })
            }
        })
    } catch (err: any) {
        await prisma.$transaction(async tx => {
            await tx.order.delete({
                where: { id: params.data?.orderId as string, userId: params.userId }
            })
            await tx.orderItems.deleteMany({
                where: { orderId: params.data?.orderId as string }
            })
        })
        console.log(err);
        throw new CustomError({ status: err.status, success: err.success, message: err.message });
    }
}
export const GetAllOrders = async (data: QueryType) => {
    try {
        if (data.cursor) {
            return await prisma.order.findMany({
                include: {
                    orderItems: {
                        include: {
                            product: {
                                omit: { id: true, quantity: true, createdAt: true, updatedAt: true }
                            }
                        },
                        omit: { id: true, productId: true, orderId: true }
                    }
                },
                take: parseInt(data.limit as string) + 1,
                cursor: { id: data.cursor },
                orderBy: { id: 'asc' }
            })
        }
        return await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: {
                            omit: { id: true, quantity: true, createdAt: true, updatedAt: true }
                        }
                    },
                    omit: { id: true, productId: true, orderId: true }
                }
            },
            take: parseInt(data.limit as string) + 1,
            orderBy: { id: 'asc' }
        })
    } catch (err: any) {
        console.log(err);
        if (err.name === "PrismaClientValidationError") throw new CustomError({ status: 400, success: false, message: `limit parameter missing` });
        throw new CustomError({ status: 500, success: false, message: err.message });
    }
}
export const GetUserOrders = async (data: GetUserOrdersType) => {
    try {
        if (data.query.cursor) {
            return await prisma.order.findMany({
                include: {
                    orderItems: {
                        include: {
                            product: {
                                omit: { id: true, createdAt: true, updatedAt: true, quantity: true }
                            }
                        },
                    }
                },
                where: { userId: data.userId as string },
                take: parseInt(data.query.limit as string) + 1,
                cursor: { id: data.query.cursor },
                orderBy: { id: 'asc' }
            })
        }
        return await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        product: {
                            omit: { id: true, createdAt: true, updatedAt: true, quantity: true }
                        }
                    }
                }
            },
            where: { userId: data.userId as string },
            take: parseInt(data.query.limit as string) + 1,
            orderBy: { id: 'asc' }
        })
    } catch (err: any) {
        console.log(err);
        if (err.name === "PrismaClientValidationError") throw new CustomError({ status: 400, success: false, message: `limit parameter missing` });
        throw new CustomError({ status: 500, success: false, message: err.message });
    }
}
export const UpdateOrderStatus = async (data: UpdateOrderStatusType) => {
    try {
        await prisma.order.update({
            where: { id: data.orderId },
            data: { status: data.status }
        })
    } catch (err: any) {
        if (err.code === "P2025") throw new CustomError({ status: 404, success: false, message: `no order matched the provided id` });
        throw new CustomError({ status: 500, success: false, message: `internal server error` });
    }
}
