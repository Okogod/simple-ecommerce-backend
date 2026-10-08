import { Router } from "express";

// Controllers
import {
    GetAllUsersController,
    GetSingleUserController,
    UpdateUserController
} from "../controllers/user.controllers.js";

// Middlewares
import {
    VerifyJwt,
    VerifyIsAdmin,
    UpdateRateLimit
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
 *      User:
 *          type: object
 *          properties:
 *              id: 
 *                  type: string
 *                  description: user id
 *              firstname:
 *                  type: string
 *                  description: user firstname
 *              lastname:
 *                  type: string
 *                  description: user lastname
 *              email:
 *                  type: string
 *                  description: user email address
 *              password: 
 *                  type: string
 *                  description: user password
 *              role:
 *                  type: string
 *                  description: user role
 *      UpdateUser:
 *          type: object
 *          properties:
 *              firstname:
 *                  type: string
 *                  description: user firstname
 *              lastname:
 *                  type: string
 *                  description: user lastname
 *              email:
 *                  type: string
 *                  description: user email address
*/
const userRoute = Router();

/**
 * @swagger
 * /v1/user/get-single-user/{userId}:
 *  get:
 *      tags:
 *          - user
 *      summary: get single user
 *      parameters:
 *          - name: userId
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *            descritpion: the maximum amoutn of resource to take
 *      security:
 *          - Bearer: []
 *      content:
 *          application/json:
 *          schema: 
*               $ref: '#/components/schemas/User'
 *      responses:
 *          200:
 *              description: user registered successfully
 *          400:
 *              description: invalid input data
 *          404:
 *              description: user not found
 *          500:
 *              description: internal server error
 */
userRoute.get("/v1/user/get-single-user/:userId", VerifyJwt, GetSingleUserController);
/**
 * @swagger
 * /v1/user/get-all-users:
 *  get:
 *      tags:
 *          - user
 *      summary: get all users
 *      parameters:
 *          - name: limit
 *            required: true
 *            in: query
 *            schema:
 *              type: string
 *            descritpion: the maximum amoutn of resource to take
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
*               $ref: '#/components/schemas/User'
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
userRoute.get("/v1/user/get-all-users", VerifyJwt, VerifyIsAdmin, GetAllUsersController);
/**
 * @swagger
 * /v1/user/update-user:
 *  patch:
 *      tags:
 *          - user
 *      summary: update user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/UpdateUser'
 *      security:
 *          - Bearer: []
 *      content:
 *          application/json:
 *          schema: 
*               $ref: '#/components/schemas/User'
 *      responses:
 *          201:
 *              description: user registered successfully
 *          400:
 *              description: invalid input data
 *          404:
 *              description: user not found
 *          500:
 *              description: internal server error
 */
userRoute.patch("/v1/user/update-user", UpdateRateLimit, VerifyJwt, UpdateUserController);

export default userRoute;