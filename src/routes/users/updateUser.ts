import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';
import { PrismaClient, User } from '@prisma/client';
import { Elysia, t } from 'elysia';

/**
 * Update an existing user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const updateUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        username: t.String(),
        role: t.String(),
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
        .put(
          '/users/:id',
          async ({ params: { id }, body, jwt, set, bearer }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!bearer) {
              set.status = 400;
              return {
                error: 'User not authenticated',
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
                error: 'User unauthorized',
                message: 'Authentication token was missing or incorrect',
              };
            }
            // * ================================================
            // * Verify that the user is an admin.
            // * ================================================
            if (user.role !== 'ADMIN') {
              set.status = 401;
              return {
                error: 'User Unauthorized',
                message:
                  'Only administrators are allowed to retrieve user information.',
              };
            }
            // * ================================================
            // * Extract the data from the request body.
            // * ================================================
            const { username, role } = body as {
              username: string;
              role: string;
            } as User;
            // * ================================================
            // * Create the user.
            // * ================================================
            try {
              const user = await prisma.user.update({
                where: {
                  id,
                },
                data: {
                  username,
                  role,
                },
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              });
              set.status = 200;
              return {
                data: {
                  user,
                },
              };
            } catch (error) {
              console.error('Failed to update user:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to update user',
              };
            }
          },
          {
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
            },
          }
        );

      return app;
    }
  );

  return app;
};
