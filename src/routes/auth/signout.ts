import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Signout route.
 *
 * The signout route is responsible for clearing the client's authentication
 * cookie. It first verifies the user's JWT, and then clears the client's
 * cookie. If the user is not authenticated, the route returns a 400 status
 * code. If the user is not authorized, the route returns a 401 status code.
 *
 * @returns The Elysia app.
 */
export const signout = () => {
  const app = new Elysia();

  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.APP_JWT_SECRET,
      })
    )
    .use(cookie())
    .post(
      '/signout',
      async ({ jwt, set, cookie: { auth }, setCookie }) => {
        // * ================================================
        // * Ensure that the user is already authenticated.
        // * ================================================
        if (!auth) {
          set.status = 400;
        }
        // * ================================================
        // * Verify the user's JWT.
        // * ================================================
        const user = await jwt.verify(auth);
        if (!user) {
          set.status = 401;
        }
        // * ================================================
        // * Clear client cookie.
        // * ================================================
        setCookie('auth', '', {
          httpOnly: true,
          maxAge: 0,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        });
        set.status = 200;
      },
      {
        detail: {
          tags: ['Auth'],
        },
      }
    );

  return app;
};
