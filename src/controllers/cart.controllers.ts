// Services
import {
    AddCartItemService,
    GetCartItemService,
    GetAllCartItemsService,
    UpdateCartItemService,
    DeleteCartItemService
} from "../services/services.js";

// Types
import type { Request, Response, NextFunction } from "express";
import type {
    ProductIdType,
    AddCartItemDataType,
    CartItemIdType,
    QueryType
} from "../types/types.js";

export const AddCartController = async (req: Request<ProductIdType, {}, AddCartItemDataType>, res: Response, next: NextFunction) => {
    try {
        await AddCartItemService({ userId: req.user.id, productId: req.params.productId, data: req.body });
        res.status(201).json({ status: 200, success: true, message: `item added to cart` });
    } catch (err) {
        next(err);
    }
}
export const GetCartItemController = async (req: Request<CartItemIdType>, res: Response, next: NextFunction) => {
    try {
        const cartItem = await GetCartItemService({ cartId: req.params.cartId })
        res.status(200).json({ status: 200, success: true, data: cartItem });
    } catch (err) {
        next(err);
    }
}
export const GetAllCartItemsController = async (req: Request<{}, {}, {}, QueryType>, res: Response, next: NextFunction) => {
    try {
        const data = await GetAllCartItemsService({ userId: { userId: req.user.id }, query: req.query });
        res.status(200).json({ status: 200, success: true, data });
    } catch (err) {
        next(err);
    }
}
export const UpdateCartItemController = async (req: Request<CartItemIdType, {}, AddCartItemDataType>, res: Response, next: NextFunction) => {
    try{
        await UpdateCartItemService({ cartId: req.params.cartId, quantity: req.body.quantity});
        res.status(201).json({ status: 200, success: true, message: `cart item updated successfully`});
    }catch(err){
        next(err);
    }
}
export const DeleteCartItemController = async (req: Request<CartItemIdType>, res: Response, next: NextFunction) => {
    try{
        await DeleteCartItemService({ cartId:req.params.cartId, userId: req.user.id});
        res.status(200).json({ status: 200, success: true, message: `cart item deleted successfully` });
    }catch(err){
        next(err);
    }
}
