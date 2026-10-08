import { Router } from "express";

// Controllers
import { 
    CreateAndPlaceOrderController,
    GetUserOrdersController,
    GetAllOrdersController, 
    UpdateOrderStatusController,
} from "../controllers/order.controllers.js";

// Middlewares
import { 
    AddRateLimit, 
    GetRateLimit,
    UpdateRateLimit, 
    VerifyJwt, 
    VerifyIsAdmin
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
 *      Order:
 *          required:
 *              - quantity
 *          properties:
 *              quantity:
 *                  type: number
 *                  description: cart item quantity
 *      Balance:
 *          required:
 *              - balance
 *          properties:
 *              balance:
 *                  type: number
 *                  description: user account balance 
 *      UpdateOrderStatus:
 *          required:
 *              - status
 *          properties:
 *              status:
 *                  type: string
 *                  description: update order status 
 */
const orderRouter = Router();

/**
 * @swagger
 * /v1/order/place-order/{userId}:
 *  post:
 *      tags:
 *          - order
 *      summary: get single user orders
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/Balance'
 *      parameters:
 *          - name: userId
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *            descritpion: id of user whose orders are to be gotten
 *      security:
 *          - Bearer: []
 *      responses:
 *          202:
 *              description: order placed successfully
 */
orderRouter.post('/v1/order/place-order/:userId', VerifyJwt, AddRateLimit, CreateAndPlaceOrderController);
/**
 * @swagger
 * /v1/order/get-user-orders/{userId}:
 *  get:
 *      tags:
 *          - order
 *      summary: get single user orders
 *      parameters:
 *          - name: userId
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *            descritpion: id of user whose orders are to be gotten
 *          - name: limit
 *            required: true
 *            in: query
 *            schema:
 *              type: string
 *            descritpion: amount of resource to get
 *      security:
 *          - Bearer: []
 *      responses:
 *          200:
 *              description: orders retrieved successfully
 *          401:
 *              description: not authorised
 *          404:
 *              description: orders not found
 *          500:
 *              description: internal server error
 */
orderRouter.get('/v1/order/get-user-orders/:userId', VerifyJwt, GetRateLimit, GetUserOrdersController);
/**
 * @swagger
 * /v1/order/get-all-orders:
 *  get:
 *      tags:
 *          - order
 *      summary: get all orders
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
 *              description: orders not found
 *          500:
 *              description: internal server error
 */
orderRouter.get('/v1/order/get-all-orders', VerifyJwt, GetRateLimit, GetAllOrdersController);
/**
 * @swagger
 * /v1/order/update-order-status/{orderId}:
 *  patch:
 *      tags:
 *          - order
 *      summary: update order
 *      security:
 *          - Bearer: []
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/UpdateOrderStatus'
 *      parameters:
 *          - name: orderId
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *            descritpion: id for order
 *      responses:
 *          201:
 *              description: order status Updated successfully
 *          401:
 *              description: not authorised
 *          404:
 *              description: order not found
 *          500:
 *              description: internal server error
 */
orderRouter.patch('/v1/order/update-order-status/:orderId', VerifyJwt, VerifyIsAdmin, UpdateRateLimit, UpdateOrderStatusController);

export default orderRouter;