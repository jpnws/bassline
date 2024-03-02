import { createApp } from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare module 'bun' {
  interface Env {
    APP_HOST: string;
    APP_PORT: number;
  }
}

const app = createApp(prisma);

app.listen({
  hostname: Bun.env.APP_HOST,
  port: Bun.env.APP_PORT,
});
