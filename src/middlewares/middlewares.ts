import Jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Types
import type { Request, Response, NextFunction } from "express";
import PARAMS from '../params/params.js';
import type { UserType } from '../types/types.js';

export class CustomError {
    public status
    public success
    public message
    constructor({ status, success, message }: { status: number, success: boolean, message: string }) {
        this.status = status
        this.success = success
        this.message = message
    }
}

// Rate Limit Middlewares
export const RegisterRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req: Request, res: Response) => {
        res.status(429).json({ status: 429, success: false, message: `too many register attempts, try again in 15 minutes` });
    }
})
export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req: Request, res: Response) => {
        res.status(429).json({ status: 429, success: false, message: `too many login attempt, try again in 15 minutes` });
    }
})
export const AddRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 15,
    handler: (req: Request, res: Response) => {
        res.status(429).json({ status: 429, success: false, message: `you have exhausted the add limit reached, try again in 5 mins` });
    }
})
export const GetRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    handler: (req: Request, res: Response) => {
        res.status(429).json({ status: 429, success: false, message: `get limit reached, try again in 5 mins` });
    }
})
export const UpdateRateLimit = rateLimit({
    windowMs: 60 * 60 * 24 * 1000,
    max: 3,
    handler: (req: Request, res: Response) => {
        res.status(429).json({ status: 429, success: false, message: `you have exhaused the update limit, try again in 24 hours` });
    }
})
export const DeleteRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    handler: (req: Request, res: Response) => {
        res.status(429).json({ status: 429, success: false, message: `you have exhausted the update limit, try again in 24 hours` });
    }
})

// Verify Jwt Middleware
export const VerifyJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get Token From Header Authorization
        const token = req.headers['authorization']?.trim().split(" ")[1];
        // Verify The Token Gotten And Get Its Payload, If Not Valid Throw An Error
        const decode: Jwt.JwtPayload = await Jwt.verify(token as string, `${PARAMS.JWT_ACCESS_TOKEN}`) as Jwt.JwtPayload;
        // Generate The Payload Goten From The Token Verification
        const user: UserType = { id: decode.id, email: decode.email, role: decode.role };
        // Send It To The Express Request User
        req.user = user;
        // Move To The Nex MiddleWare
        next();
    } catch (err: any) {
        next({ status: 400, success: false, message: err.message });
    }
}
export const VerifyIsAdmin = async (req: Request, _: Response, next: NextFunction) => {
    // Verify The Role Passed To The Express Request User, If Role Is Not Admin, Throw Forbidden Error, Else Move To The Next Middleware
    if (!req.user.role.toLowerCase().includes("admin")) throw new CustomError({ status: 403, success: false, message: `unauthorised access` })
    next();

}

// Error Handler Middleware
export const ErrorHandler = async (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    res.status(error.status ?? 500).json({ status: error.status ?? 500, success: error.success ?? false, message: error.message ?? `internal server error` });
}