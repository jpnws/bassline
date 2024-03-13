import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';

import UserController from 'src/users/UserController';

/**
 * Update an existing user by its ID.
 *
 * @param userController - UserController class.
 * @returns The Elysia app.
 */
export const updateUser = (userController: UserController) => {
  const app = new Elysia();
  app.put('/users/:id', userController.updateUser, routeSpec);
  return app;
};

const routeSpec = {
  params: t.Object({
    id: t.Numeric(),
  }),
  body: t.Object({
    username: t.String(),
    role: t.String(),
  }),
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
