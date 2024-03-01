import { createApp } from './app';

declare module 'bun' {
  interface Env {
    APP_HOST: string;
    APP_PORT: number;
  }
}

const app = createApp();

app.listen({
  hostname: Bun.env.APP_HOST,
  port: Bun.env.APP_PORT,
});
