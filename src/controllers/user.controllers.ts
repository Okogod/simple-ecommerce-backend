// Types
import type { Request, Response, NextFunction } from "express";
import type {
    QueryType,
    UserIdType,
    UpdateUserDataType
} from "../types/types.js";

// Services
import {
    GetAllUsersService,
    GetSingleUserService,
    UpdateUserService
} from "../services/services.js";

// Utils
import { ConverToLowerCase } from "../utils/utils.js";

export const GetAllUsersController = async (req: Request<{}, {}, {}, QueryType>, res: Response, next: NextFunction) => {
    try {
        const { users, cursor } = await GetAllUsersService(req.query);
        res.status(200).json({ success: true, data: users, cursor });
    } catch (err) {
        next(err);
    }
}
export const GetSingleUserController = async (req: Request<UserIdType>, res: Response, next: NextFunction) => {
    try {
        const data = await GetSingleUserService({ userId: req.params.userId });
        res.status(200).json({ status: 200, success: true, data });
    } catch (err) {
        next(err);
    }
}
export const UpdateUserController = async (req: Request<{}, {}, UpdateUserDataType>, res: Response, next: NextFunction) => {
    try{
        await UpdateUserService({id: req.user.id, data: ConverToLowerCase(req.body)});
        res.status(201).json({ status: 201, success: true, message: `profile updated successfully`});
    }catch(err){
        next(err);
    }
}
