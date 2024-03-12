import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';
import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';

import { PrismaClient } from '@prisma/client';

import UserController from 'src/routes/users/UserController';
import UserRepository from 'src/routes/users/UserRepository';

/**
 * Update an existing user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const updateUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  const userRepository = new UserRepository(prisma);
  const userController = new UserController(userRepository);

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        username: t.String(),
        role: t.String(),
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
        .put('/users/:id', userController.updateUser, openApiSpec);

      return app;
    }
  );

  return app;
};

const openApiSpec = {
  detail: {
    tags: ['Users'],
    // OpenAPIV3.ResponsesObject
    responses: {
      200: {
        description: 'User Updated',
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
  } as OpenAPIV3.OperationObject,
};
