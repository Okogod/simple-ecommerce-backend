// Services
import {
    RegisterUserService,
    LoginUserService,
    UpdatePasswordService,
    ResendRefreshTokenService
} from "../services/services.js";

// Types
import type { Request, Response, NextFunction } from "express";
import type {
    UserRegisterType,
    UserLoginType,
    ChangePasswordDataType,
    ResendRefreshTokenType
} from "../types/types.js";

export const RegisterUserController = async (req: Request<{}, {}, UserRegisterType>, res: Response, next: NextFunction) => {
    try {
        await RegisterUserService(req.body);
        res.status(201).json({ success: true, message: `registration successful` });
    } catch (err) {
        next(err);
    }
}
export const LoginUserController = async (req: Request<{}, {}, UserLoginType>, res: Response, next: NextFunction) => {
    try {
        const data = await LoginUserService(req.body);
        res.status(200).json({ success: true, data })
    } catch (err) {
        next(err);
    }
}
export const UpdatePasswordController = async (req: Request<{}, {}, ChangePasswordDataType>, res: Response, next: NextFunction) => {
    try {
        await UpdatePasswordService({ id: req.user.id, data: req.body })
        res.status(201).json({ status: 201, success: true, message: `password updated successfully` });
    } catch (err) {
        next(err);
    }
}
export const ResendRefreshTokenController = async (req: Request<{}, {}, ResendRefreshTokenType>, res: Response, next: NextFunction) => {
    try {
        const { accessToken, refreshToken } = await ResendRefreshTokenService(req.body);
        res.status(200).json({ status: 200, accessToken, refreshToken });
    } catch (err) {
        next(err);
    }
}
