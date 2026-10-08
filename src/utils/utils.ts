import Jwt from 'jsonwebtoken';
import { redis } from '../config/config.js';

import { CustomError } from "../middlewares/middlewares.js";

import type {
    GenerateJwtType,
    CacheDataType,
    GenerateCacheKeyType
} from '../types/types.js';

// Cache Utils
export const GenerateCacheKey = (data: GenerateCacheKeyType) => {
    // Generate Cache Key Based On If Id Is Provided Or Not
    if (data.id) return `${data.key}:${data.id}`;
    return `${data.key}`;
}
export const CacheData = async (data: CacheDataType) => {
    try {
        // Set The Cache Data With It's Time To Live
        await redis.setEx(data.key, data.seconds, data.value);
    } catch (err: any) {
        throw new CustomError({ status: err.status, success: false, message: err.message });
    }
}
export const GetCacheData = async ({ key }: { key: string }) => {
    try {
        // Get The Cache Data And Return It As JSON
        const data = JSON.parse(await redis.get(key) as string);
        return data;
    } catch (err: any) {
        throw new CustomError({ status: err.status, success: false, message: err.message });
    }
}
export const DeleteCacheData = async (key: string) => {
    let initialCursor = "0";
    // Find All Data That Matches The Pattern Provided And Delete Them
    do {
        const { cursor, keys } = await redis.scan(initialCursor, { COUNT: 100, MATCH: `${key}*` });
        initialCursor = cursor;
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } while (initialCursor !== "0");
}


export const VerifyRequestBody = async (data: any) => {
    try {
        // If No Data Was Passed Send An Error Message
        if (!data) throw new CustomError({ status: 400, success: false, message: `no request body` });
        // Break Down Input Into Keys And Values
        const keys = Object.keys(data);
        const values = Object.values(data);
        // Verify Each Key And Return Error If Found
        values.forEach((val, index) => {
            if (typeof val === "string") {
                if (val.trim() === "") throw new CustomError({ status: 400, success: false, message: `${keys[index]} was empty` })
            }
        })
    } catch (err: any) {
        throw new CustomError({ status: 400, success: false, message: err.message })
    }
}

export const ConverToLowerCase = (data: any) => {
    // Return The PAssed Value As Lower Case If It Is A String Value That Was Passed.
    if (typeof data === "string") return data.toLowerCase();

    else if (typeof data === "object") {
        const placeHolder: any = {};
        // Break Down Input Into Keys And Values
        const keys = Object.keys(data);
        const values = Object.values(data);
        // Verify Each Key And Return Error If Found
        values.forEach((val, index) => {
            const key = keys[index];
            placeHolder[key as string] = (val as string).toLowerCase()
        })
        return placeHolder;
    }
    return
}

export const GenerateJwt = async (data: GenerateJwtType) => {
    try {
        // Generate And Return JWT Token
        const token = await Jwt.sign(data.payload, data.secret, data.options)
        return token;
    } catch (err: any) {
        throw new CustomError({ status: err.status, success: false, message: err.message });
    }
}


