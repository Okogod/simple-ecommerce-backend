import type { JwtPayload, SignOptions } from 'jsonwebtoken';


// Integrating User As A Type In Express Request
declare global {
    namespace Express {
        interface Request {
            user: UserType
        }
    }
}

// Global Types
export type UserType = {
    id: string
    email: string
    role: string
}
export type ProductType = {
    id: string
    name: string
    price: number
    quantity: number
}
export type CartItemType = {
    id: string;
    quantity: number;
    userId: string;
    productId: string;
}
export type OrderType = {
    id: string,
    userId: string,
    totalAmount: number,
    status: 'COMPLETED' | 'PENDING'
}
export type QueryType = {
    limit?: string | number
    cursor?: string
}




// Utils Type
export type GenerateJwtType = {
    payload: JwtPayload
    secret: string
    options: SignOptions
}
export type GenerateCacheKeyType = {
    key: string
    id?: string
}



// Cache Types
export type CacheDataType = {
    key: string
    seconds: number
    value: string
}



// Authentication Types
export type ChangePasswordDataType = {
    password: string
}
export type ChangePasswordType = {
    id: string
    data: ChangePasswordDataType
}
export type UserRegisterType = {
    firstname: string
    lastname: string
    email: string
    password: string
    role?: string
}
export type UserLoginType = {
    email: string
    password: string
}
export type ResendRefreshTokenType = {
    refreshToken: string
}


// User Types
export type UserIdType = {
    userId: string
}
export type GetUserType = {
    id?: string
    email?: string
}
export type UpdateUserDataType = {
    firstname: string
    lastname: string
    email: string
}
export type UpdateUserType = {
    id: string
    data: UpdateUserDataType
}


// Product Types
export type ProductIdType = {
    productId: string
}
export type AddProductType = {
    name: string
    price: number
    quantity: number
}
export type UpdateProductDataType = {
    name?: string
    price?: number
    quantity?: number
}
export type UpdateProductType = {
    id: string
    data: UpdateProductDataType
}


// Cart Types
export type CartItemIdType = {
    cartId: string
}
export type AddCartItemDataType = {
    quantity: number
}
export type AddCartItemType = {
    userId: string
    productId: string
    data: AddCartItemDataType
}
export type GetCartItemType = {
    userId: string
    productId: string
}
export type GetUserOrdersType = {
    query: QueryType
    userId: string
}
export type GetAllCartItemsType = {
    query: QueryType,
    userId: UserIdType
}
export type UpdateCartItemType = {
    cartId: string
    quantity: number
}
export type DeleteCartItemType = {
    userId: string
    cartId: string
}


// Order Types
export type OrderIdType = {
    orderId: string
}
export type ProcessOrderDataType = {
    totalAmount: number
    orderId: string
}
export type ProcessOrderType = {
    userId: string
    data?: ProcessOrderDataType
    balance: number
}
export type OrderStatusType = {
    status: string
}
export type UpdateOrderStatusType = {
    userId?: string
    orderId: string
    status: "COMPLETED"
}
