import { createApp } from './app';
import { PrismaClient } from '@prisma/client';
import { swagger } from '@elysiajs/swagger';

const prisma = new PrismaClient();

const app = createApp(prisma, swagger);

app.listen(
  {
    hostname: Bun.env.APP_HOST,
    port: Bun.env.APP_PORT,
  },
  (server) => {
    console.log(`Listening on ${server.hostname}:${server.port}`);
  }
);
