import { OpenAPIV3 } from 'openapi-types';
import { Elysia, t } from 'elysia';

import UserController from 'src/users/UserController';

/**
 * Delete a user by its ID.
 *
 * @param userController - UserController class.
 * @returns The Elysia app.
 */
export const deleteUser = (userController: UserController) => {
  const app = new Elysia();
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
