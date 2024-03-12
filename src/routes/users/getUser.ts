import { Elysia, t } from 'elysia';
import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';

import { PrismaClient } from '@prisma/client';

import UserController from 'src/routes/users/UserController';
import UserRepository from 'src/routes/users/UserRepository';

/**
 * Retrieve a single user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  const userRepository = new UserRepository(prisma);
  const userController = new UserController(userRepository);

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
        .get('/users/:id', userController.getUserById, openApiSpec);

      return app;
    }
  );

  return app;
};

const openApiSpec = {
  detail: {
    tags: ['Users'],
    responses: {
      200: {
        description: 'User Retrieved',
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
};
