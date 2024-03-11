import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';
import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import UserController from 'src/routes/users/UserController';

/**
 * Retrieve a single user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getUser = (prisma: PrismaClient) => {
  const app = new Elysia();
  const userController = new UserController(prisma);

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
        .get('/users/:id', userController.getUserById, {
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
        });

      return app;
    }
  );

  return app;
};
