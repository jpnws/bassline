import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';

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

  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  app.delete('/users/:id', userController.deleteUserById, routeSpec);

  return app;
};

const routeSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
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
