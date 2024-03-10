import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';
import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';

/**
 * Retrieve a single user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
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
        .get(
          '/users/:id',
          async ({ params: { id }, jwt, set, bearer }) => {
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
                message:
                  'Only administrators are allowed to retrieve user information.',
              };
            }
            // * ================================================
            // * Retrieve the user.
            // * ================================================
            try {
              const user = await prisma.user.findUnique({
                where: {
                  id: id,
                },
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              });
              if (!user) {
                set.status = 404;
                return {
                  error: 'User Not Found',
                  message: 'The user with the specified ID does not exist.',
                };
              }
              set.status = 200;
              return {
                data: {
                  user,
                },
              };
            } catch (error) {
              console.error('Failed to retrieve user:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to retrieve user.',
              };
            }
          },
          {
            detail: {
              tags: ['Users'],
              responses: {
                200: {
                  description: 'User Retrieved',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              user: {
                                type: 'object',
                                properties: {
                                  id: {
                                    type: 'number',
                                  },
                                  username: {
                                    type: 'string',
                                  },
                                  role: {
                                    type: 'string',
                                  },
                                },
                              },
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
                  description: 'User Not Authorized',
                },
                404: {
                  description: 'User Not Found',
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
