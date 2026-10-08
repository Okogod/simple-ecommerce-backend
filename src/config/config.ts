import { createClient } from 'redis';

import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client.js';

import { Mutex } from 'async-mutex';

import swaggerJSDoc from 'swagger-jsdoc';

import PARAMS from '../params/params.js';

// Redis Configuration
const redis = createClient();
await redis.connect();
redis.on("error", (err) => console.error(err));

// Prisma Configuration
const adapter = new PrismaMariaDb({
    host: `${PARAMS.DB_HOST}`,
    user: `${PARAMS.DB_USER}`,
    password: `${PARAMS.DB_PASSWORD}`,
    database: `${PARAMS.DB_NAME}`
})
const prisma = new PrismaClient({ adapter });

// Products Mutex Configuration
const getAllProductsMutex = new Mutex();
const getSingleProductsMutex = new Mutex();

// Swagger Configuration
const swaggerJsDocOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simple E-commerce Backend',
            version: '1.0.0',
            description: 'A simple e-commerce backend'
        },
        tags: [
            {
                name: 'auth',
                description: 'Routes for managing authentications'
            },
            {
                name: 'user',
                description: 'Routes for managing users'
            },
            {
                name: 'product',
                description: 'Routes for managing products'
            },
            {
                name: 'cart',
                description: 'Routes for managing carts'
            },
            {
                name: 'order',
                description: 'Routes for managing orders'
            }
        ],
        servers: [
            {
                url: `http://localhost:${PARAMS.PORT}`,
                description: 'development server'
            }
        ],
        components: {
            securitySchemes: {
                Bearer: {
                    type: 'http',
                    schema: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token authorization for the API'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts', './dist/routes/*.js']
}
const swaggerSpec = swaggerJSDoc(swaggerJsDocOptions);

export { redis, prisma, getAllProductsMutex, getSingleProductsMutex, swaggerSpec }
