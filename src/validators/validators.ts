// Types
import type {
    UserRegisterType,
    UserLoginType,
    QueryType,
    UpdateUserDataType,
    ChangePasswordDataType,
    AddProductType,
    UpdateProductDataType,
    AddCartItemDataType,
    OrderStatusType
} from "../types/types.js";

// Utils
import { VerifyRequestBody } from "../utils/utils.js";

import PARAMS from "../params/params.js";

import { CustomError } from "../middlewares/middlewares.js";

// Auth Validator
export const ValidateAuthRequest = async (data: UserRegisterType | UserLoginType | UpdateUserDataType | ChangePasswordDataType) => {
    try {
        // Verify Input Data
        await VerifyRequestBody(data);
        // Break Down Input Into Keys And Values
        const keys = Object.keys(data);
        const values = Object.values(data);
        // Verify Each Key And Return Error If Found
        keys.forEach((k, index) => {
            if (k === "firstname" || k === "lastname") {
                if (!PARAMS.NAME_REGEX.test(values[index] as string)) throw new CustomError({ status: 400, success: false, message: `${keys[index]} can only contains letters, hyphens` });
            }
            else if (k === "email") {
                if (!PARAMS.EMAIL_REGEX.test(values[index] as string)) throw new CustomError({ status: 400, success: false, message: `invalid email pattern` });
            }
            else if (k === "role") {
                if ("ADMIN".toLowerCase() !== (values[index] as string).toLowerCase()) throw new CustomError({ status: 400, success: false, message: `invalid email pattern` });
            }
            else {
                if (!PARAMS.PASSWORD_REGEX.test(values[index] as string)) throw new CustomError({ status: 400, success: false, message: `password must contain atleast an upper and lower case letter, a special character, 1 digit and must be 8 characters long.` });
            }
        })
    } catch (err: any) {
        throw new CustomError({ status: err.status, success: false, message: err.message });
    }
}

// Product Validator
export const ValidateAddProductRequest = async (data: AddProductType | UpdateProductDataType | AddCartItemDataType) => {
    // Break Down Input Into Keys And Values
    const keys = Object.keys(data);
    const values = Object.values(data);
    // Verify Each Key And Return Error If Found
    keys.forEach((k, index) => {
        if (k === "name") {
            if (typeof values[index] !== "string") throw new CustomError({ status: 400, success: false, message: `${keys[index]} can only contains string` });
            if ((values[index] as string)?.length < 3) throw new CustomError({ status: 400, success: false, message: `invalid product name` });
        }
        else if (k === "price" || k === "quantity") {
            if (typeof values[index] === "string") throw new CustomError({ status: 400, success: false, message: `${keys[index]} can only contains ${k === "price" ? "decimal" : "integer"} values` });
            if (values[index] === 0) throw new CustomError({ status: 400, success: false, message: `${keys[index]} can not take "0" as a value` });
        }
    })
}

// Query Validator
export const ValidateQueryLimit = async (data: QueryType) => {
    // Check If The Limit Value Is Passed And Ensure That It Doesn't Pass The rovided Limit Value
    if (data.limit && data.limit !== PARAMS.QUERY_LIMIT) throw new CustomError({ status: 400, success: false, message: `limit must be string and have a value of 10` });
}

// Order Status Validaor
export const ValidateOrderStatus = async (params: OrderStatusType) => {
    // Ensure The Status Value Passed Can Only Be "completed" Or "COMPLETED"
    if (params.status.toLowerCase() !== "completed") throw new CustomError({ status: 400, success: false, message: `order status can only be updated to "COMPLETED" or "completed"` });
}
