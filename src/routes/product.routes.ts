import { Router } from "express";

// Controllers
import { 
    AddProductController,
    GetSingleProductController,
    GetAllProductsController,
    UpdateProductController,
    DeleteSingleProductController,
    DeleteAllProductController 
} from "../controllers/product.controllers.js";

// Middlewares
import { 
    AddRateLimit, 
    GetRateLimit,
    UpdateRateLimit, 
    DeleteRateLimit,
    VerifyJwt, 
    VerifyIsAdmin 
} from "../middlewares/middlewares.js";

/** 
 * @swagger
 * components:
 *  securitySchemes:
 *     Bearer:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  schemas:
 *      Product:
 *          type: object
 *          required:
 *              - name
 *              - price
 *              - quantity
 *          properties:
 *              name:
 *                  type: string
 *                  description: product name
 *              price:
 *                  type: number
 *                  description: product price
 *              quantity:
 *                  type: number
 *                  description: product quantity
 *      UpdateProduct:
 *          type: object
 *          properties:
 *              name:
 *                  type: string
 *                  description: product name
 *              price:
 *                  type: number
 *                  description: product price
 *              quantity:
 *                  type: number
 *                  description: product quantity
*/
const productRoute = Router();

/**
 * @swagger
 * /v1/product/add-product:
 *  post:
 *      tags:
 *          - product
 *      summary: add product
 *      security:
 *          - Bearer: []
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/Product'
 *      responses:
 *          201:
 *              description: refresh token sent successfully
 *          400:
 *              description: invalid input data
 *          401:
 *              description: not authorised
 *          409:
 *              description: product name already exists
 *          500:
 *              description: internal server error
 */
productRoute.post('/v1/product/add-product', AddRateLimit, VerifyJwt, VerifyIsAdmin, AddProductController);
/**
 * @swagger
 * /v1/product/get-single-product/{productId}:
 *  get:
 *      tags:
 *          - product
 *      security:
 *          - Bearer: []
 *      parameters:
 *          - name: productId
 *            in: path
 *            required: true
 *            schema:
 *              type: string
 *              description: product id
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#componenets/schemas/Product'
 *      responses:
 *          200:
 *              description: success
 *          400:
 *              description: invalid data
 *          404: 
 *              description: product not found
 *          500: 
 *              description: internal server error
 */
productRoute.get('/v1/product/get-single-product/:productId', GetSingleProductController);
// productRoute.get('/v1/product/get-single-product/:productId', VerifyJwt, GetRateLimit, GetSingleProductController);
/**
 * @swagger
 * /v1/product/get-all-product:
 *  get:
 *      tags:
 *          - product
 *      summary: get all products
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
 *      content:
 *          application/json:
 *          schema: 
*               $ref: '#/components/schemas/Product'
 *      responses:
 *          201:
 *              description: user registered successfully
 *          400:
 *              description: invalid input data
 *          404:
 *              description: users not found
 *          500:
 *              description: internal server error
 */
productRoute.get('/v1/product/get-all-product', VerifyJwt, GetRateLimit, GetAllProductsController);
/**
 * @swagger
 * /v1/product/update-product/{productId}:
 *  patch:
 *      tags:
 *          - product
 *      summary: update product
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
*                   $ref: '#/components/schemas/UpdateProduct'
 *          properties:
 *              schemas:
 *                  $ref: '#/components/schemas/Product'
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#componenets/schemas/Product'
 *      responses:
 *          200:
 *              description: success
 *          400:
 *              description: invalid data
 *          404: 
 *              description: product not found
 *          500: 
 *              description: internal server error
 */
productRoute.patch('/v1/product/update-product/:productId', UpdateRateLimit, VerifyJwt, VerifyIsAdmin, UpdateProductController);
/**
 * @swagger
 * /v1/product/delete-single-product/{productId}:
 *  delete:
 *      tags:
 *          - product
 *      summary: delete single product
 *      security:
 *          - Bearer: []
 *      parameters:
 *          - name: productId
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
productRoute.delete('/v1/product/delete-single-product/:productId', DeleteRateLimit, VerifyJwt, VerifyIsAdmin, DeleteSingleProductController);
/**
 * @swagger
 * /v1/product/delete-all-product:
 *  delete:
 *      tags:
 *          - product
 *      summary: delete all products
 *      security:
 *          - Bearer: []
 *      responses:
 *          200:
 *              description: success
 *          500: 
 *              description: internal server error
 */
productRoute.delete('/v1/product/delete-all-product', DeleteRateLimit, VerifyJwt, VerifyIsAdmin, DeleteAllProductController);

export default productRoute;