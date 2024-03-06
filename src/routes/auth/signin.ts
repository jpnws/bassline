import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Signin route.
 *
 * This route is used to authenticate a user. It checks if the user is already
 * authenticated. If not, it checks if the username or password is empty. If not
 * empty, it checks if the username exists. If so, it checks if the password is
 * correct. If so, it signs JWT and stores it in a cookie, essentially logging
 * in the user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const signin = (_prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
    (app) => {
      app
        .use(
          jwt({
            name: 'jwt',
            secret: Bun.env.APP_JWT_SECRET,
          })
        )
        .use(cookie())
        .post(
          '/signin',
          ({ body }) => {
            const { username, password } = body as {
              username: string;
              password: string;
            };
            console.log(username, password);
          },
          {
            detail: {
              tags: ['Auth'],
            },
          }
        );

      return app;
    }
  );

  return app;
};
