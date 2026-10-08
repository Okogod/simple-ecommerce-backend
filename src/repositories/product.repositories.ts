import { prisma } from '../config/config.js';

// Types
import type {
    AddProductType,
    ProductIdType,
    QueryType,
    UpdateProductType
} from '../types/types.js';

import { CustomError } from '../middlewares/middlewares.js';

export const AddProduct = async (data: AddProductType) => {
    try {
        // Add Product To Database If Not Product With Same Name Exist, If Not Throw Confluct Error
        await prisma.product.create({
            data
        })
    } catch (err: any) {
        if (err.code === "P2002") throw new CustomError({ status: 409, success: false, message: `product with this name already exist` });
        throw new CustomError({ status: 500, success: false, message: `internal server error` });
    }
}
export const GetSingleProduct = async (data: ProductIdType) => {
    // Get Product Whose Id Was Provided
    return await prisma.product.findUnique({
        where: {
            id: data.productId
        },
        omit: { createdAt: true, updatedAt: true }
    })
}
export const GetAllProducts = async (data: QueryType) => {
    try {
        // If Cursor Was Provided, Get Products From Where Cursor Points And Within The Take Limit
        if (data.cursor) {
            return await prisma.product.findMany({
                take: parseInt(data.limit as string) + 1,
                cursor: { id: data.cursor },
                omit: { createdAt: true, updatedAt: true },
                orderBy: { createdAt: 'asc' }
            })
        }
        // Return First Provided Products Within The Take Limit
        return await prisma.product.findMany({
            take: parseInt(data.limit as string) + 1,
            omit: { createdAt: true, updatedAt: true },
            orderBy: { createdAt: 'asc' }
        })
    } catch (err: any) {
        console.log(err);
        if (err.name === "PrismaClientValidationError") throw new CustomError({ status: 400, success: false, message: `limit parameter missing` });
        throw new CustomError({ status: 500, success: false, message: err.message });
    }
}
export const UpdateProduct = async (params: UpdateProductType) => {
    try {
        // Update Details Of The Product Of Whose Id Was Passed If Found, And The Details That Was Provided, Else Throw A User Not Found Error
        await prisma.product.update({
            where: { id: params.id },
            data: params.data
        })
    } catch (err: any) {
        if (err.code === "P2025") throw new CustomError({ status: 404, success: false, message: `no product matched the provided id` });
        throw new CustomError({ status: 500, success: false, message: `internal server error` });
    }
}
export const DeleteSingleProduct = async (data: ProductIdType) => {
    try {
        // Delete The Product Whose Id Was Passed
        await prisma.product.delete({
            where: { id: data.productId }
        });
    } catch (err: any) {
        if (err.code === "P2025") throw new CustomError({ status: 404, success: false, message: `product does not exist` });
        throw new CustomError({ status: 500, success: false, message: err.message });
    }
}
export const DeleteAllProduct = async () => {
    // Delete All Products
    await prisma.product.deleteMany();
}
