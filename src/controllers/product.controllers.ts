// Types
import type { Request, Response, NextFunction } from "express";

// Services
import { 
    AddProductService,
    GetSingleProductService,
    GetAllProductsService,
    UpdateProductService,
    DeleteSingleProductService,
    DeleteAllProductService
} from "../services/services.js";

// Types
import type { 
    AddProductType, 
    ProductIdType,
    QueryType,
    UpdateProductDataType
} from "../types/types.js";


export const AddProductController = async (req: Request<{}, {}, AddProductType>, res: Response, next: NextFunction) => {
    try{
        await AddProductService(req.body);
        res.status(201).json({ status: 201, success: true, message: `product added successfully`});
    }catch(err){
        next(err);
    }
}
export const GetAllProductsController = async (req: Request<{}, {}, {}, QueryType>, res: Response, next: NextFunction) => {
    try {
        const { products, cursor } = await GetAllProductsService(req.query);
        res.status(200).json({ success: true, data: products, cursor });
    } catch (err) {
        next(err);
    }
}
export const GetSingleProductController = async (req: Request<ProductIdType>, res: Response, next: NextFunction) => {
    try {
        const data = await GetSingleProductService({ productId: req.params.productId });
        res.status(200).json({ status: 200, success: true, data });
    } catch (err) {
        next(err);
    }
}
export const UpdateProductController = async (req: Request<ProductIdType, {}, UpdateProductDataType>, res: Response, next: NextFunction) => {
    try{
        await UpdateProductService({id: req.params.productId, data: req.body.name ? { ...req.body, name: req.body.name?.toLowerCase() } : req.body});
        res.status(201).json({ status: 201, success: true, message: `product updated successfully`});
    }catch(err){
        next(err);
    }
}
export const DeleteSingleProductController = async (req: Request<ProductIdType>, res: Response, next: NextFunction) => {
    try{
        await DeleteSingleProductService(req.params);
        res.status(200).json({ status: 200, success: true, message: `product deleted successfully`});
    }catch(err){
        next(err);
    }
}
export const DeleteAllProductController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        await DeleteAllProductService();
        res.status(200).json({ status: 200, success: true, message: `All products deleted successfully`});
    }catch(err){
        next(err);
    }
}