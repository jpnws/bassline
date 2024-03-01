import { createApp } from './app';

declare module 'bun' {
  interface Env {
    APP_HOST: string;
    APP_PORT: number;
  }
}

const app = createApp();

app.listen({
  hostname: process.env.APP_HOST,
  port: process.env.APP_PORT,
});
