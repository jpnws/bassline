import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';

import { PrismaClient } from '@prisma/client';

import UserController from 'src/users/UserController';
import UserRepository from 'src/users/UserRepository';
import UserService from 'src/users/UserService';

/**
 * Create a new user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const createUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  app.post('/users', userController.createUser, routeSpec);

  return app;
};

const routeSpec = {
  body: t.Object({
    username: t.String(),
    password: t.String(),
  }),
  detail: {
    tags: ['Users'],
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
  } as OpenAPIV3.OperationObject,
};
