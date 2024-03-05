import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

export const signout = () => {
  const app = new Elysia();

  app
    .use(
      jwt({
        name: 'jwt',
        secret: Bun.env.APP_JWT_SECRET,
      })
    )
    .use(cookie())
    .post('/signout', async ({ jwt, set, cookie: { auth }, setCookie }) => {
      // * ================================================
      // * Ensure that the user is already authenticated.
      // * ================================================
      if (!auth) {
        set.status = 400;
        return {
          message: 'You were not authenticated.',
        };
      }
      // * ================================================
      // * Verify the user's JWT.
      // * ================================================
      const user = await jwt.verify(auth);
      if (!user) {
        set.status = 401;
        return {
          message: 'You are not authorized to sign out.',
        };
      }
      // * ================================================
      // * Clear client cookie.
      // * ================================================
      setCookie('auth', '', {
        httpOnly: true,
        maxAge: 0,
        path: '/',
        secure: Bun.env.NODE_ENV === 'production',
      });
      set.status = 200;
    });

  return app;
};
