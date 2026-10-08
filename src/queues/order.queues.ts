import { Queue } from "bullmq";

import PARAMS from "../params/params.js";

const orderQueue = new Queue(PARAMS.ORDER_QUEUE_NAME, { connection: PARAMS.QUEUE_REDIS_CONNECTION_OPTION});

export default orderQueue;