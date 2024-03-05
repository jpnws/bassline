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
      .post('/signout', ({ set, jwt, cookie: { auth } }) => {
        // * ================================================
        // * Ensure that the user is already authenticated.
        // * ================================================
        if (!auth) {
          set.status = 400;
          return {
            message: 'You were not authenticated.',
          };
        }
      })
  );

  return app;
};
