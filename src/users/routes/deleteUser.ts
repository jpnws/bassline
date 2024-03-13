import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';
import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';

import { PrismaClient } from '@prisma/client';

import UserController from 'src/users/UserController';
import UserRepository from 'src/users/UserRepository';
import UserService from 'src/users/UserService';

/**
 * Delete a user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const deleteUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
    (app) => {
      const userRepository = new UserRepository(prisma);
      const userService = new UserService(userRepository);
      const userController = new UserController(userService);

      app
        .use(
          jwt({
            name: 'jwt',
            secret: process.env.APP_JWT_SECRET,
          })
        )
        .use(bearer())
        .delete('/users/:id', userController.deleteUserById, openApiSpec);

      return app;
    }
  );

  return app;
};

const openApiSpec = {
  detail: {
    tags: ['Users'],
    responses: {
      202: {
        description: 'User Deleted',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
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
