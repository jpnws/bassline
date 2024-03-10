import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';
import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';

/**
 * Create a new user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const createUser = (prisma: PrismaClient) => {
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
            secret: process.env.APP_JWT_SECRET,
          })
        )
        .use(bearer())
        .post(
          '/users',
          async ({ body, jwt, set, bearer }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!bearer) {
              set.status = 400;
              return {
                error: 'User Not Authenticated',
                message: 'Authentication token was missing.',
              };
            }
            // * ================================================
            // * Verify the user's JWT.
            // * ================================================
            const user = (await jwt.verify(bearer)) as UserBody;
            if (!user) {
              set.status = 401;
              return {
                error: 'User Unauthorized',
                message: 'Authentication toekn was missing or incorrect',
              };
            }
            // * ================================================
            // * Verify that the user is an admin.
            // * ================================================
            if (user.role !== 'ADMIN') {
              set.status = 401;
              return {
                error: 'User Unauthorized',
                message: 'Only administrators are allowed to create new users.',
              };
            }
            // * ================================================
            // * Extract the data from the request body.
            // * ================================================
            const { username, password } = body as {
              username: string;
              password: string;
            };
            // * ================================================
            // * Create a new user.
            // * ================================================
            try {
              const user = await prisma.user.create({
                data: {
                  username,
                  hash: await Bun.password.hash(password),
                },
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              });
              set.status = 201;
              return {
                data: {
                  user,
                },
              };
            } catch (error) {
              console.error('Failed to create user:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to create user.',
              };
            }
          },
          {
            detail: {
              tags: ['Users'],
              // OpenAPIV3.ResponsesObject
              responses: {
                201: {
                  description: 'User Created',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              username: { type: 'string' },
                              role: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                400: {
                  description: 'User Not Authenticated',
                },
                401: {
                  description: 'User Unauthorized',
                },
                500: {
                  description: 'Internal Server Error',
                },
              },
            },
          }
        );

      return app;
    }
  );

  return app;
};
