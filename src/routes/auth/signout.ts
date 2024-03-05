import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

export const signout = () => {
  const app = new Elysia();

  app.guard({}, (app) =>
    app
      .use(
        jwt({
          name: 'jwt',
          secret: Bun.env.APP_JWT_SECRET,
        })
      )
      .use(cookie())
      .post('/signout', ({}) => {})
  );

  return app;
};
