import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';
import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';

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
        id: t.Number(),
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
        .delete(
          '/users/:id',
          async ({ params: { id }, jwt, set, bearer }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!bearer) {
              set.status = 400;
              return {
                error: 'User Not Authenticated',
                message: 'Authentication token was missing.',
              };
            }
            // * ================================================
            // * Verify the user's JWT.
            // * ================================================
            const user = (await jwt.verify(bearer)) as UserBody;
            if (!user) {
              set.status = 401;
              return {
                error: 'User Unauthorized',
                message: 'Authentication toekn was missing or incorrect',
              };
            }
            // * ================================================
            // * Verify that the user is an admin.
            // * ================================================
            if (user.role !== 'ADMIN') {
              set.status = 401;
              return {
                error: 'User Unauthorized',
                message: 'Only administrators are allowed to create new users.',
              };
            }
            // * ================================================
            // * Delete the user.
            // * ================================================
            try {
              await prisma.user.delete({
                where: {
                  id,
                },
              });
              set.status = 202;
              return {
                message: 'User deleted successfully.',
              };
            } catch (error) {
              console.error('Failed to delete user:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to delete user.',
              };
            }
          },
          {
            detail: {
              tags: ['Users'],
              // OpenAPIV3.ResponsesObject
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
            },
          }
        );

      return app;
    }
  );

  return app;
};
