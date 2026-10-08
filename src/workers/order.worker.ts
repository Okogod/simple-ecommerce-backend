import { Worker, Job } from "bullmq";

// Services
import { CreateAndPlaceOrderService } from "../services/services.js";

import PARAMS from "../params/params.js";

const orderWorker = new Worker(PARAMS.ORDER_QUEUE_NAME, async (job: Job) => {
    // Execute Create And Place Order Service
    await CreateAndPlaceOrderService({
        userId: job.data.userId,
        balance: job.data.balance,
    }
    );
},
    {
        connection: PARAMS.QUEUE_REDIS_CONNECTION_OPTION
    }
)
orderWorker.on("completed", (job: Job) => console.log("job" + job.id + "with" + job.data + "completed"))