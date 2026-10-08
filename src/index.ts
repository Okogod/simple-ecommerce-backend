import app from "./server.js";

import PARAMS from "./params/params.js";

app.listen(PARAMS.PORT, () => {
    console.log(`app running on: http://localhost:${PARAMS.PORT}`);
    console.log(`swagger docs running on: http://localhost:${PARAMS.PORT}/api-docs`);
})