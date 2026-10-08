// Service
import {
    UpdateOrderStatusService,
    GetAllOrdersService,
    GetUserOrdersService
} from "../services/services.js";

// Queues
import orderQueue from "../queues/order.queues.js";

// Types
import type { Request, Response, NextFunction } from "express";
import type {
    UserIdType,
    ProcessOrderType,
    OrderIdType,
    OrderStatusType,
    QueryType,
} from "../types/types.js";

import PARAMS from "../params/params.js";

export const CreateAndPlaceOrderController = async (req: Request<UserIdType, {}, ProcessOrderType>, res: Response, next: NextFunction) => {
    try {
        await orderQueue.add(PARAMS.ORDER_WORKER_NAME, { userId: req.params.userId, balance: req.body.balance });
        res.status(202).json({ status: 202, message: `order has been placed and is being processed` });
    } catch (err) {
        next(err);
    }
}
export const GetAllOrdersController = async (req: Request<{}, {}, {}, QueryType>, res: Response, next: NextFunction) => {
    try {
        const orders = await GetAllOrdersService(req.query);
        res.status(200).json({ status: 200, success: true, data: orders })
    } catch (err) {
        next(err);
    }
}
export const GetUserOrdersController = async (req: Request<UserIdType, {}, {}, QueryType>, res: Response, next: NextFunction) => {
    try {
        const userOrders = await GetUserOrdersService({query: req.query, userId: req.params.userId});
        res.status(200).json({ status: 200, success: true, data: userOrders })
    } catch (err) {
        next(err);
    }
}
export const UpdateOrderStatusController = async (req: Request<OrderIdType, {}, OrderStatusType>, res: Response, next: NextFunction) => {
    try {
        await UpdateOrderStatusService({ orderId: req.params.orderId, status: req.body.status as "COMPLETED" });
        res.status(201).json({ status: 201, success: true, message: `order status updated successfully` });
    } catch (err) {
        next(err);
    }
}
