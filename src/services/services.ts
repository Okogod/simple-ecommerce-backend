import { hash, compare } from 'bcrypt';
import Jwt from 'jsonwebtoken';

// Configs
import { getAllProductsMutex, getSingleProductsMutex } from '../config/config.js';

// Validators
import {
    ValidateAuthRequest,
    ValidateQueryLimit,
    ValidateAddProductRequest,
    ValidateOrderStatus
} from "../validators/validators.js";

// Repositories
import {
    RegisterUser,
    GetUserByEmailOrId,
    ChangePassword
} from '../repositories/auth.repositories.js';
import {
    GetAllUsers,
    GetSingleUser,
    UpdateUser
} from '../repositories/user.repositories.js';
import {
    AddProduct,
    GetSingleProduct,
    GetAllProducts,
    UpdateProduct,
    DeleteSingleProduct,
    DeleteAllProduct,
} from '../repositories/product.repositories.js';
import {
    CheckIfCartItemExists,
    AddCartItem,
    GetCartItem,
    GetAllCartItems,
    UpdateCartItem,
    DeleteCartItem
} from '../repositories/cart.repositories.js';
import {
    CreateOrder,
    ProcessOrder,
    UpdateOrderStatus,
    GetAllOrders,
    GetUserOrders
} from '../repositories/order.repositories.js';

// Utils
import {
    ConverToLowerCase,
    GenerateJwt,
    GenerateCacheKey,
    GetCacheData,
    CacheData,
    DeleteCacheData
} from "../utils/utils.js";

// Types
import type {
    UserRegisterType,
    UserLoginType,
    ChangePasswordType,
    ChangePasswordDataType,
    QueryType,
    UserType,
    UserIdType,
    UpdateUserType,
    ResendRefreshTokenType,
    AddProductType,
    ProductIdType,
    UpdateProductType,
    ProductType,
    AddCartItemType,
    CartItemIdType,
    GetAllCartItemsType,
    CartItemType,
    UpdateCartItemType,
    DeleteCartItemType,
    ProcessOrderType,
    UpdateOrderStatusType,
    OrderType,
    GetUserOrdersType
} from "../types/types.js";

import { CustomError } from "../middlewares/middlewares.js";

import PARAMS from '../params/params.js';


// Auth Services
export const RegisterUserService = async (params: UserRegisterType) => {
    // Validate Input Data
    await ValidateAuthRequest(params);
    // Convert Request Body To Lower Case
    const userData: UserRegisterType = ConverToLowerCase(params);
    // Hash Password
    userData.password = await hash(params.password.toLowerCase(), 10);
    // Register User To The Database If No User With Same Mail Exists, If Not Throw Conflict Error
    await RegisterUser(userData);
    // Delete Cache For All Users
    await DeleteCacheData(`${PARAMS.GET_ALL_USERS_CACHE_KEY}`);
}
export const LoginUserService = async (params: UserLoginType) => {
    // Validate Input Data
    await ValidateAuthRequest(params);
    // Get User By Email From The Database, If No User Was Found, Throw Not Authorised Error
    const user = await GetUserByEmailOrId({ email: params.email.toLowerCase() });
    if (!user) throw new CustomError({ status: 401, success: false, message: `invalid email or password` });
    // Compare The Found User Password With The Request Body Password
    const hashedPassword = user.password;
    const isPasswordMatch = await compare(params.password.toLowerCase(), hashedPassword);
    // If No Match, Throw Not Authorised Error
    if (!isPasswordMatch) throw new CustomError({ status: 401, success: false, message: `invalid email password` });
    // Create Payload And Generate The Access And Refresh Tokens, And Return It
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = await GenerateJwt({ payload, secret: `${PARAMS.JWT_ACCESS_TOKEN}`, options: { expiresIn: '15m' } })
    const refreshToken = await GenerateJwt({ payload, secret: `${PARAMS.JWT_REFRESH_TOKEN}`, options: { expiresIn: '7d' } })
    return { ...payload, accessToken, refreshToken };
}
export const UpdatePasswordService = async (params: ChangePasswordType) => {
    // Validate Input Data
    await ValidateAuthRequest(params.data as ChangePasswordDataType);
    // Convert The Password To Lower Case
    const convertedPassword = ConverToLowerCase(params.data);
    // Hash The Password
    const hashedPassword = await hash(convertedPassword.password, 10);
    // Change The User's Password On The Database
    await ChangePassword({ id: params.id, data: { password: hashedPassword } });
    // Delete Cache Data For That User
    const userCacheKey = GenerateCacheKey({ key: PARAMS.GET_SINGLE_USER_CACHE_KEY, id: params.id });
    await DeleteCacheData(userCacheKey);
}
export const ResendRefreshTokenService = async (params: ResendRefreshTokenType) => {
    try {
        // Verify The Token Passed and Throw An Error If Found
        const decode: Jwt.JwtPayload = await Jwt.verify(params.refreshToken, `${PARAMS.JWT_REFRESH_TOKEN}`) as Jwt.JwtPayload;
        // Create Payload From The Gotten Decode After VErifying The Passed Token
        const payload = { id: decode.id as string, email: decode.email, role: decode.role };
        // Gnerate The Access And Refresh Token and Return Them
        const accessToken = await GenerateJwt({ payload, secret: `${PARAMS.JWT_ACCESS_TOKEN}`, options: { expiresIn: '15m' } })
        const refreshToken = await GenerateJwt({ payload, secret: `${PARAMS.JWT_REFRESH_TOKEN}`, options: { expiresIn: '7d' } })
        return { accessToken, refreshToken };
    } catch (err: any) {
        throw new CustomError({
            status: err.name === "TokenExpiredError" ? 401 : 400,
            success: false,
            message: err.message
        });
    }
}


export const GetSingleUserService = async (params: UserIdType) => {
    // Generate Key To Find User From Cache
    const userCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_SINGLE_USER_CACHE_KEY}`, id: `${params.userId}` });
    // Get User and Return If Found
    const cachedUser = await GetCacheData({ key: userCacheKey });
    if (cachedUser) return cachedUser;
    // Get User From Database If Not Found In Cache
    const user = await GetSingleUser({ userId: params.userId });
    // If User Not Found In The Database, Throw A Not Found Error
    if (!user) throw new CustomError({ status: 404, success: true, message: `user not found` });
    // Cache The Gotten User From The Database And Return
    await CacheData({ key: userCacheKey, seconds: 60 * 30, value: JSON.stringify(user) });
    return user;
}
export const GetAllUsersService = async (params: QueryType) => {
    // Validate Input Data
    await ValidateQueryLimit(params);
    // Generate Cache Key Based On If Cursor Was Provided Or Not
    const userCacheKey = !params.cursor ? GenerateCacheKey({ key: `${PARAMS.GET_ALL_USERS_CACHE_KEY}:${params.limit}` }) : GenerateCacheKey({ key: `${PARAMS.GET_ALL_USERS_CACHE_KEY}${params.limit}${params.cursor}` });
    // Get Cached Users From Generated Key And Return It
    const cachedData = await GetCacheData({ key: userCacheKey });
    if (cachedData) return cachedData;
    // If USers Not Found In The Cache, Get Them From The Database.
    const users = await GetAllUsers(params) as UserType[];
    // If No Users Were Found, Throw A Users Not Found Error
    if (users?.length < 1) throw new CustomError({ status: 404, success: false, message: `no user available` });
    // Split The Gotten User Within The Query LImit And Send The Id Of The Last User As Cursor If It Exists
    const cursor = users.length > parseInt(PARAMS.QUERY_LIMIT) ? users[users.length - 1]?.id : null;
    // Generate The response To Be Sent
    const response = { users: users.filter(u => u.id !== cursor), cursor }
    // Cache The Users
    await CacheData({ key: userCacheKey, seconds: 3600, value: JSON.stringify(response) })
    // Return The Generated Response
    return response;
}
export const UpdateUserService = async (params: UpdateUserType) => {
    // Validate Input Data
    await ValidateAuthRequest(params.data);
    // Update User If Found
    await UpdateUser(params);
    // Generate The CacheKey For THat User And Delete The Cached Data For Tha User
    const userCacheKey = GenerateCacheKey({ key: PARAMS.GET_SINGLE_USER_CACHE_KEY, id: params.id });
    await DeleteCacheData(userCacheKey);
}


export const AddProductService = async (params: AddProductType) => {
    // Validate Input Data
    await ValidateAddProductRequest(params);
    // Convert Request Body  Name Parameter To Lower Case
    const convertedProductName = ConverToLowerCase(params.name);
    // Generate The Data To Be Added To The DataBase
    const data = { name: convertedProductName, price: params.price, quantity: params.quantity };
    // Add The Product Data To The Database
    await AddProduct(data);
    // Delete All Products Cache For Getting All Products
    await DeleteCacheData(`${PARAMS.GET_ALL_PRODUCTS_CACHE_KEY}`);
}
export const GetSingleProductService = async (params: ProductIdType) => {
    // Generate Key To Find Product From Cache
    const productCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_SINGLE_PRODUCT_CACHE_KEY}`, id: `${params.productId}` });
    // Get Product and Return If Found
    const cachedProduct = await GetCacheData({ key: productCacheKey });
    if (cachedProduct) return cachedProduct;
    // Create A Lock 
    const getSingleProductRelease = await getSingleProductsMutex.acquire();
    try {
        // Recheck If The Product Is Now In Cache And Return It
        const reCheckedCachedProduct = await GetCacheData({ key: productCacheKey });
        if (reCheckedCachedProduct) return reCheckedCachedProduct;
        // Get The Product From The Database
        const product = await GetSingleProduct({ productId: params.productId });
        // If The Product Was Not Found, Throw A Product Not Found Error
        if (!product) throw new CustomError({ status: 404, success: true, message: `product not found` });
        // Cache The Gotten Product And Return The Product Gotten From The Database
        await CacheData({ key: productCacheKey, seconds: 60 * 30, value: JSON.stringify(product) });
        return product;
    } finally {
        // Release The Lock
        getSingleProductRelease();
    }
}
export const GetAllProductsService = async (params: QueryType) => {
    // Validate Input Data
    await ValidateQueryLimit(params);
    // Generate Cache Key Based On If Cursor Was Provided Or Not
    const productsCacheKey = !params.cursor ? GenerateCacheKey({ key: `${PARAMS.GET_ALL_PRODUCTS_CACHE_KEY}:${params.limit}` }) : GenerateCacheKey({ key: `${PARAMS.GET_ALL_PRODUCTS_CACHE_KEY}${params.limit}${params.cursor}` });
    // Get Cached Products From Generated Key And Return It
    const cachedProduct = await GetCacheData({ key: productsCacheKey });
    if (cachedProduct) return cachedProduct;
    // Create A Lock 
    const getAllProductsRelease = await getAllProductsMutex.acquire();
    try {
        // Recheck If The Products Is Now In Cache And Return It
        const reCheckedCachedProduct = await GetCacheData({ key: productsCacheKey });
        if (reCheckedCachedProduct) return reCheckedCachedProduct;
        // Get The Products From The Database
        const products = await GetAllProducts(params) as ProductType[];
        // If No Prodcuts were Found, Return A No Products Found Error
        if (products.length < 1) throw new CustomError({ status: 404, success: false, message: `no user available` });
        // Split The Gotten Products Within The Query LImit And Send The Id Of The Last Product As Cursor If It Exists
        const cursor = products.length > parseInt(PARAMS.QUERY_LIMIT) ? products[products.length - 1]?.id : null;
        // Generate The response To Be Sent
        const response = { products: products.filter(u => u.id !== cursor), cursor }
        // Cache The Products
        await CacheData({ key: productsCacheKey, seconds: 3600, value: JSON.stringify(response) })
        return response;
        // Return The Generated Response
    } finally {
        // Release The Lock
        getAllProductsRelease();
    }
}
export const UpdateProductService = async (params: UpdateProductType) => {
    // Validate Input Data
    await ValidateAddProductRequest(params.data);
    // Update Product If Found
    await UpdateProduct(params);
    // Delete Cache For All Products And All Single Product
    await DeleteCacheData(PARAMS.GET_ALL_PRODUCTS_CACHE_KEY);
    await DeleteCacheData(PARAMS.GET_SINGLE_PRODUCT_CACHE_KEY);
}
export const DeleteSingleProductService = async (params: ProductIdType) => {
    // Delete The Product Whose Id Was Passed From The Database
    await DeleteSingleProduct(params);
    // Delete The Cache For All Products And The Product Whose Id Was Passed
    const productCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_SINGLE_PRODUCT_CACHE_KEY}`, id: `${params.productId}` });
    await DeleteCacheData(productCacheKey);
}
export const DeleteAllProductService = async () => {
    // Delete All Products From The Database
    await DeleteAllProduct();
    // Delete Cache For All Products And All Single Product
    await DeleteCacheData(PARAMS.GET_ALL_PRODUCTS_CACHE_KEY);
    await DeleteCacheData(PARAMS.GET_SINGLE_PRODUCT_CACHE_KEY);
}


export const AddCartItemService = async (params: AddCartItemType) => {
    // Validate Input Data
    await ValidateAddProductRequest(params.data);
    // Validate User Id If It Exists, If Not Throw User Not Found Error
    const user = await GetUserByEmailOrId({ id: params.userId });
    if (!user) throw new CustomError({ status: 404, success: false, message: `user not found` });
    // Validate Product Id If Product Exists, If Not Throw Product Not Found Error
    const product = await GetSingleProduct({ productId: params.productId });
    if (!product) throw new CustomError({ status: 404, success: false, message: `product not found` });
    // Check If The Product Already Exists In The User's Cart, If So, Send a Conflict Error
    const cartItem = await CheckIfCartItemExists({ userId: params.userId, productId: params.productId });
    if (cartItem) throw new CustomError({ status: 409, success: false, message: `cart item already exists, please update` });
    // Add Item To Cart And Delete User Cart Item Cache
    await AddCartItem(params);
    await DeleteCacheData(`${PARAMS.GET_ALL_CART_ITEMS_CACHE_KEY}`);
}
export const GetCartItemService = async (params: CartItemIdType) => {
    // Generate Key To Find Cart Item From Cache
    const cartItemCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_SINGLE_CART_ITEM_CACHE_KEY}`, id: `${params.cartId}` });
    // Get Cart Item and Return If Found
    const cachedCartItem = await GetCacheData({ key: cartItemCacheKey });
    if (cachedCartItem) return cachedCartItem;
    // Get The Cart Item From The Database
    const cartItem = await GetCartItem({ cartId: params.cartId });
    // If The Cart Item Was Not Found, Throw A Cart Item Not Found Error
    if (!cartItem) throw new CustomError({ status: 404, success: true, message: `cart item not found` });
    // Cache The Gotten Cart Item And Return The Cart Item Gotten From The Database
    await CacheData({ key: cartItemCacheKey, seconds: 60 * 30, value: JSON.stringify(cartItem) });
    return cartItem;
}
export const GetAllCartItemsService = async (params: GetAllCartItemsType) => {
    // Validate Input Data
    await ValidateQueryLimit(params.query);
    // Generate Cache Key Based On If Cursor Was Provided Or Not
    const cartItemsCacheKey = !params.query.cursor ? GenerateCacheKey({ key: `${PARAMS.GET_ALL_CART_ITEMS_CACHE_KEY}:${params.userId}:${params.query.limit}` }) : GenerateCacheKey({ key: `${PARAMS.GET_ALL_CART_ITEMS_CACHE_KEY}:${params.userId}:${params.query.limit}:${params.query.cursor}` });
    // Get Cached Cart Items From Generated Key And Return It
    const cachedCartItems = await GetCacheData({ key: cartItemsCacheKey });
    if (cachedCartItems) return cachedCartItems;
    // Get The Cart Items From The Database
    const cartItems = await GetAllCartItems(params) as CartItemType[];
    // If No Cart Items were Found, Return A No Cart Items Found Error
    if (cartItems.length < 1) throw new CustomError({ status: 404, success: false, message: `no user available` });
    // Split The Gotten Cart Items Within The Query LImit And Send The Id Of The Last Cart Item As Cursor If It Exists
    const cursor = cartItems.length > parseInt(PARAMS.QUERY_LIMIT) ? cartItems[cartItems.length - 1]?.id : null;
    // Generate The response To Be Sent
    const response = { cartItems: cartItems.filter(u => u.id !== cursor), cursor }
    // Cache The Cart Items
    await CacheData({ key: cartItemsCacheKey, seconds: 3600, value: JSON.stringify(response) })
    // Return The Generated Response
    return response;
}
export const UpdateCartItemService = async (params: UpdateCartItemType) => {
    // Validate Input Data
    await ValidateAddProductRequest({ quantity: params.quantity });
    // Update Cart Item If Found
    await UpdateCartItem(params);
    // Delete Cache For All Cart Items And All Single Cart Item
    await DeleteCacheData(PARAMS.GET_ALL_CART_ITEMS_CACHE_KEY);
    await DeleteCacheData(PARAMS.GET_SINGLE_CART_ITEM_CACHE_KEY);

}
export const DeleteCartItemService = async (params: DeleteCartItemType) => {
    // Delete All Products From The Database
    await DeleteCartItem(params);
    // Generate Cart Item Cache Key
    const cartItemCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_SINGLE_PRODUCT_CACHE_KEY}`, id: `${params.cartId}` });
    // Delete Cache For All Car Items And All Cart Item
    await DeleteCacheData(cartItemCacheKey);
    await DeleteCacheData(`${PARAMS.GET_ALL_CART_ITEMS_CACHE_KEY}:${params.userId}`);
}


export const CreateAndPlaceOrderService = async (params: ProcessOrderType) => {
    try {
        // Create Order And Return Total Amount And Order Id
        const { totalAmount, orderId } = await CreateOrder({ userId: params.userId });
        // Process The Order
        await ProcessOrder({ balance: params.balance, userId: params.userId, data: { totalAmount, orderId } });
        // Delete All Order Cache
        await DeleteCacheData(PARAMS.GET_ALL_ORDERS);
        // Generate User Order Cache Key
        const userOrderCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_USER_ORDERS}:${params.userId}` })
        // Delete All Cached User Order 
        await DeleteCacheData(userOrderCacheKey);
    } catch (err: any) {
        console.log(err, "From CreateAndPlaceOrderService");
    }
}
export const GetAllOrdersService = async (params: QueryType) => {
    // Validate Input Data
    await ValidateQueryLimit(params);
    // Generate Cache Key Based On If Cursor Was Provided Or Not
    const orderCaheKey = !params.cursor ? GenerateCacheKey({ key: `${PARAMS.GET_ALL_ORDERS}:${params.limit}` }) : GenerateCacheKey({ key: `${PARAMS.GET_ALL_ORDERS}${params.limit}${params.cursor}` });
    // Get Cached Orders From Generated Key And Return It
    const cachedOrders = await GetCacheData({ key: orderCaheKey });
    if (cachedOrders) return cachedOrders;
    // Get The Orders From The Database
    const orders: OrderType[] = await GetAllOrders(params) as OrderType[];
    // If No Orders were Found, Return A No Order Found Error
    if (orders.length < 1) throw new CustomError({ status: 404, success: false, message: `no ordes available` });
    // Split The Gotten Orders Within The Query LImit And Send The Id Of The Last Order As Cursor If It Exists
    const cursor = orders.length > parseInt(PARAMS.QUERY_LIMIT) ? orders[orders.length - 1]?.id : null;
    // Generate The response To Be Sent
    const response = { orders: orders.filter(u => u.id !== cursor), cursor }
    // Cache The Order
    await CacheData({ key: orderCaheKey, seconds: 3600, value: JSON.stringify(response) })
    // Return The Generated Response
    return response;
}
export const GetUserOrdersService = async (params: GetUserOrdersType) => {
    // Validate Input Data
    await ValidateQueryLimit(params.query);
    // Generate Cache Key Based On If Cursor Was Provided Or Not
    const userOrdersCacheKey = !params.query.cursor ? GenerateCacheKey({ key: `${PARAMS.GET_USER_ORDERS}:${params.userId}:${params.query.limit}` }) : GenerateCacheKey({ key: `${PARAMS.GET_USER_ORDERS}:${params.userId}:${params.query.limit}${params.query.cursor}` });
    // Get Cached Orders From Generated Key And Return It
    const cachedUserOrders = await GetCacheData({ key: userOrdersCacheKey });
    if (cachedUserOrders) return cachedUserOrders;
    // Get The Orders From The Database
    const userOrders: OrderType[] = await GetUserOrders(params) as OrderType[];
    // If No Orders were Found, Return A No Order Found Error
    if (userOrders.length < 1) throw new CustomError({ status: 404, success: false, message: `no order available for this user` });
    // Split The Gotten Orders Within The Query LImit And Send The Id Of The Last Order As Cursor If It Exists
    const cursor = userOrders.length > parseInt(PARAMS.QUERY_LIMIT) ? userOrders[userOrders.length - 1]?.id : null;
    // Generate The response To Be Sent
    const response = { userOrders: userOrders.filter(u => u.id !== cursor), cursor }
    // Cache The Order
    await CacheData({ key: userOrdersCacheKey, seconds: 3600, value: JSON.stringify(response) })
    // Return The Generated Response
    return response;
}
export const UpdateOrderStatusService = async (params: UpdateOrderStatusType) => {
    // Validate Input Data
    await ValidateOrderStatus({ status: params.status });
    // Update Order Status
    await UpdateOrderStatus({ orderId: params.orderId, status: params.status.toUpperCase() as "COMPLETED" });
    // Generate User Cart Item And Delete The Cache Data
    const userOrderCacheKey = GenerateCacheKey({ key: `${PARAMS.GET_USER_ORDERS}:${params.orderId}` })
    await DeleteCacheData(userOrderCacheKey);
}
