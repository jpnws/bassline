import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { PrismaClient } from '@prisma/client';
import { createApp } from 'src/app';

const prisma = new PrismaClient();

const app = createApp(prisma, swagger, cors);

app.listen(
  {
    hostname: process.env.APP_HOST,
    port: process.env.APP_PORT,
  },
  (server) => {
    console.log(`Listening on ${server.hostname}:${server.port}`);
  },
);
