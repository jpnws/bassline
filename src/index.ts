import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { PrismaClient } from '@prisma/client';
import { createApp } from 'src/app';
import { rateLimit } from 'elysia-rate-limit';

const prisma = new PrismaClient();

const app = createApp(prisma, swagger, cors, rateLimit);

app.listen(
  {
    hostname: process.env.APP_HOST,
    port: process.env.APP_PORT,
  },
  (server) => {
    console.log(`Listening on ${server.hostname}:${server.port}`);
  },
);
