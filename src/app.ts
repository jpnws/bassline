import { Elysia } from 'elysia';

export const createApp = () => {
  const app = new Elysia();

  app.get('/', () => 'Disco Bassline!');

  return app;
};
