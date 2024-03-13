import { OpenAPIV3 } from 'openapi-types';
import { Elysia } from 'elysia';

import { PrismaClient } from '@prisma/client';

import UserController from 'src/users/UserController';
import UserRepository from 'src/users/UserRepository';
import UserService from 'src/users/UserService';

/**
 * Get the current logged in user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getCurrentUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  const userRepository = new UserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  app.get('/users/current', userController.getCurrentUser, openApiSpec);

  return app;
};

const openApiSpec = {
  detail: {
    tags: ['Users'],
    // OpenAPIV3.ResponsesObject
    responses: {
      200: {
        description: 'User retrieved',
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
        description: 'User not authenticated',
      },
      401: {
        description: 'User not authorized',
      },
      404: {
        description: 'User not found',
      },
      500: {
        description: 'An unexpected error occurred',
      },
    },
  } as OpenAPIV3.OperationObject,
};
