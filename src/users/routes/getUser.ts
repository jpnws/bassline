import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';

import UserController from 'src/users/UserController';

/**
 * Retrieve a single user by its ID.
 *
 * @param userController - UserController class.
 * @returns The Elysia app.
 */
export const getUser = (userController: UserController) => {
  const app = new Elysia();
  app.get('/users/:id', userController.getUserById, routeSpec);
  return app;
};

const routeSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
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
  } as OpenAPIV3.OperationObject,
};
