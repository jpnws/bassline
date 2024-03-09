import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

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
    .use(bearer())
    .post(
      '/signout',
      async ({ jwt, set, bearer }) => {
        // * ================================================
        // * Ensure that the user is already authenticated.
        // * ================================================
        if (!bearer) {
          set.status = 400;
        }
        // * ================================================
        // * Verify the user's JWT.
        // * ================================================
        const user = await jwt.verify(bearer);
        if (!user) {
          set.status = 401;
        }
        set.status = 200;
      },
      {
        detail: {
          tags: ['Auth'],
          // OpenAPIV3.ResponseObject
          responses: {
            200: {
              description: 'OK',
            },
            400: {
              description: 'Bad Request',
            },
            401: {
              description: 'Unauthorized',
            },
          },
        },
      }
    );

  return app;
};
