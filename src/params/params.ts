import { config } from 'dotenv';

config();

const PARAMS = {
    PORT: process.env.PORT,

    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DATABASE_URL: process.env.DATABASE_URL,

    JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN,
    JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN,

    NAME_REGEX: /^[A-Za-z]{3,20}$/,
    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-A0-9.-]+\.[a-zA-Z]{2,}$/,
    PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,

    QUERY_LIMIT: "10",

    GET_ALL_USERS_CACHE_KEY: `users_cache_key`,
    GET_SINGLE_USER_CACHE_KEY: `single_user_cache_key`,
    GET_ALL_PRODUCTS_CACHE_KEY: `products_cache_key`,
    GET_SINGLE_PRODUCT_CACHE_KEY: `single_product_cache_key`,
    GET_ALL_CART_ITEMS_CACHE_KEY: `cart_items_cache_key`,
    GET_SINGLE_CART_ITEM_CACHE_KEY: `single_cart_item_cache_key`,
    GET_ALL_ORDERS: `get_all_orders_key`,
    GET_USER_ORDERS: `get_user_orders_key`,

    ORDER_QUEUE_NAME: `order_queue`,
    ORDER_WORKER_NAME: `process-order`,

    QUEUE_REDIS_CONNECTION_OPTION : {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT
    }

}

export default PARAMS;