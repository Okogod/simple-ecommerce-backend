import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

// Configs
import { swaggerSpec } from './config/config.js';

// Routes
import authRoute from './routes/auth.routes.js';
import userRoute from './routes/user.routes.js';
import productRoute from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';

import { ErrorHandler } from './middlewares/middlewares.js';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoute);
app.use(userRoute);
app.use(productRoute);
app.use(cartRouter);
app.use(orderRouter);

app.use(ErrorHandler);

export default app;