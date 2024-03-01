import { Elysia } from 'elysia';

export const createApp = () => {
  const app = new Elysia();

  app.get('/boards/:id/posts', () => {});

  app.get('/posts/:id', () => {});

  app.post('/posts', () => {});

  app.put('/posts/:id', () => {});

  app.delete('/posts/:id', () => {});

  return app;
};
