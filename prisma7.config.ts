import { defineConfig } from "prisma/config";

import PARAMS from './src/params/params';


export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: PARAMS.DATABASE_URL,
  },
});
