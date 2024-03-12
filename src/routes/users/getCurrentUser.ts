import { OpenAPIV3 } from 'openapi-types';
import { Elysia } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

import { PrismaClient } from '@prisma/client';

import UserController from 'src/routes/users/UserController';
import UserRepository from 'src/routes/users/UserRepository';

/**
 * Get the current logged in user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getCurrentUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  const userRepository = new UserRepository(prisma);
  const userController = new UserController(userRepository);

  app.group('', {}, (app) => {
    app
      .use(
        jwt({
          name: 'jwt',
          secret: process.env.APP_JWT_SECRET,
        })
      )
      .use(bearer())
      .get('/users/current', userController.getCurrentUser, openApiSpec);

    return app;
  });

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
