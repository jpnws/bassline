import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';

import UserController from 'src/users/UserController';

/**
 * Create a new user.
 *
 * @param userController - UserController class.
 * @returns The Elysia app.
 */
export const createUser = (userController: UserController) => {
  const app = new Elysia();
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
