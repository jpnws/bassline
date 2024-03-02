import { createApp } from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = createApp(prisma);

app.listen({
  hostname: Bun.env.APP_HOST,
  port: Bun.env.APP_PORT,
});
