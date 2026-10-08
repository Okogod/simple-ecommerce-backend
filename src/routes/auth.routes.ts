import { Router } from "express";

// Controllers 
import {
    RegisterUserController,
    LoginUserController,
    UpdatePasswordController,
    ResendRefreshTokenController
} from "../controllers/auth.controllers.js";

// Middlewares
import {
    RegisterRateLimit,
    loginRateLimit,
    UpdateRateLimit,
    VerifyJwt
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
 *      Register:
 *          type: object
 *          required:
 *              - firstname
 *              - lastname
 *              - email
 *              - password
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
 *              password: 
 *                  type: string
 *                  description: user password
 *              role:
 *                  type: string
 *                  description: user role
 *      Login:
 *          type: object
 *          required:
 *              - email
 *              - password
 *          properties:
 *              email:
 *                  type: string
 *                  description: user email address
 *              password: 
 *                  type: string
 *                  description: user password
 *      ChangePassword:
 *          type: object
 *          required:
 *              - password
 *          properties:
 *              password: 
 *                  type: string
 *                  description: user password
 *      ResendRefreshToken:
 *          type: object
 *          required:
 *              - refreshToken
 *          properties:
 *              refreshToken: 
 *                  type: string
 *                  description: refresh Token

*/
const authRoute = Router();

/**
 * @swagger
 * /v1/auth/register-user:
 *  post:
 *      tags:
 *          - auth
 *      summary: register user
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/Register'
 *      responses:
 *          201:
 *              description: user registered successfully
 *          400:
 *              description: invalid input data
 *          409:
 *              description: user already exists
 *          500:
 *              description: internal server error
 * 
 */
authRoute.post('/v1/auth/register-user', RegisterRateLimit, RegisterUserController);
/**
 * @swagger
 * /v1/auth/login-user:
 *  post:
 *      tags:
 *          - auth
 *      summary: login user
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/Login'
 *      responses:
 *          200:
 *              description: user registered successfully
 *          400:
 *              description: invalid input data
 *          401:
 *              description: invalid email or password
 *          500:
 *              description: internal server error
 * 
 */
authRoute.post('/v1/auth/login-user', loginRateLimit, LoginUserController);
/**
 * @swagger
 * /v1/auth/change-password:
 *  patch:
 *      tags:
 *          - auth
 *      summary: change user password
 *      security:
 *          - Bearer: []
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/ChangePassword'
 *      responses:
 *          200:
 *              description: user registered successfully
 *          400:
 *              description: invalid input data
 *          401:
 *              description: not authorised
 *          404:
 *              description: user not found
 *          500:
 *              description: internal server error
 * 
 */
authRoute.patch('/v1/auth/change-password', VerifyJwt, UpdateRateLimit, UpdatePasswordController);
/**
 * @swagger
 * /v1/auth/resend-refresh-token:
 *  post:
 *      tags:
 *          - auth
 *      summary: resend refresh token
 *      requestBody: 
 *          required: true
 *          content:
 *              application/json:
 *                  schema: 
*                   $ref: '#/components/schemas/ResendRefreshToken'
 *      responses:
 *          200:
 *              description: refresh token sent successfully
 *          400:
 *              description: invalid input data
 *          401:
 *              description: not authorised
 *          500:
 *              description: internal server error
 * 
 */
authRoute.post('/v1/auth/resend-refresh-token', ResendRefreshTokenController);

export default authRoute;