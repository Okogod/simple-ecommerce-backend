import { Router } from "express";

// Controllers
import { 
    AddCartController,
    GetCartItemController,
    GetAllCartItemsController,
    UpdateCartItemController,
    DeleteCartItemController
 } from "../controllers/cart.controllers.js";

// Middlewares
import { 
    VerifyJwt, 
    AddRateLimit, 
    GetRateLimit,
    UpdateRateLimit,
    DeleteRateLimit
} from "../middlewares/middlewares.js";

/**
 * @swagger
 * components:
 *  securitySchemes:
 *      Bearer:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *  schemas:
 *      CartItem:
 *          required:
 *              - quantity
 *          properties:
 *              quantity:
 *                  type: number
 *                  description: cart item quantity
 */
const cartRouter = Router();

/**
 * @swagger
 * /v1/cart/add-cart-item/{productId}:
 *  post:
 *      tags:
 *          - cart
 *      summary: add item to cart
 *      security:
 *          - Bearer: []
 *      parameters:
 *          - name: productId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *              description: product id
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/CartItem'
 *      responses:
 *          201:
 *              description: refresh token sent successfully
 *          400:
 *              description: invalid input data
 *          401:
 *              description: not authorised
 *          404:
 *              description: product not found
 *          500:
 *              description: internal server error
 */
cartRouter.post('/v1/cart/add-cart-item/:productId', AddRateLimit, VerifyJwt, AddCartController);
/**
 * @swagger
 * /v1/cart/get-cart-item/{cartId}:
 *  get:
 *      tags:
 *          - cart
 *      summary: get cart item
 *      security:
 *          - Bearer: []
 *      parameters:
 *          - name: cartId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *              description: cart item id
 *      responses:
 *          200:
 *              description: cart item retrieved successfully
 *          401:
 *              description: not authorised
 *          404:
 *              description: cart item not found
 *          500:
 *              description: internal server error
 */
cartRouter.get('/v1/cart/get-cart-item/:cartId', GetRateLimit, VerifyJwt, GetCartItemController);
/**
 * @swagger
 * /v1/cart/get-all-cart-items:
 *  get:
 *      tags:
 *          - cart
 *      summary: get all cart item
 *      parameters:
 *          - name: limit
 *            required: true
 *            in: query
 *            schema:
 *              type: string
 *            descritpion: the maximum amount of resource to take
 *          - name: cursor
 *            in: query
 *            schema:
 *              type: string
 *            descritpion: the pointer to the next resource in the database
 *      security:
 *          - Bearer: []
 *      responses:
 *          200:
 *              description: cart items retrieved successfully
 *          401:
 *              description: not authorised
 *          404:
 *              description: cart item not found
 *          500:
 *              description: internal server error
 */
cartRouter.get('/v1/cart/get-all-cart-items', GetRateLimit, VerifyJwt, GetAllCartItemsController);
/**
 * @swagger
 * /v1/cart/update-cart-item/{cartId}:
 *  patch:
 *      tags:
 *          - cart
 *      summary: update cart item
 *      security:
 *          - Bearer: []
 *      parameters:
 *          - name: cartId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *              description: cart item id
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/CartItem'
 *      responses:
 *          201:
 *              description: cart item updated successfully
 *          401:
 *              description: not authorised
 *          404:
 *              description: cart item not found
 *          500:
 *              description: internal server error
 */
cartRouter.patch('/v1/cart/update-cart-item/:cartId', UpdateRateLimit, VerifyJwt, UpdateCartItemController);
/**
 * @swagger
 * /v1/cart/delete-cart-item/{cartId}:
 *  delete:
 *      tags:
 *          - cart
 *      summary: delete single cart item
 *      security:
 *          - Bearer: []
 *      parameters:
 *          - name: cartId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *              description: product id
 *      responses:
 *          200:
 *              description: success
 *          401:
 *              description: unauthorised
 *          500: 
 *              description: internal server error
 */
cartRouter.delete('/v1/cart/delete-cart-item/:cartId', DeleteRateLimit, VerifyJwt, DeleteCartItemController);

export default cartRouter;