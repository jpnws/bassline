import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Get the current logged in user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getCurrentUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group('', {}, (app) => {
    app
      .use(
        jwt({
          name: 'jwt',
          secret: process.env.APP_JWT_SECRET,
        })
      )
      .use(cookie())
      .get(
        '/users/current',
        async ({ jwt, set, cookie: { auth } }) => {
          // * ================================================
          // * Ensure that the user is already authenticated.
          // * ================================================
          if (!auth) {
            set.status = 400;
            return;
          }
          // * ================================================
          // * Verify the user's JWT.
          // * ================================================
          const authUser = (await jwt.verify(auth)) as UserBody;
          if (!authUser) {
            set.status = 401;
            return;
          }
          // * ================================================
          // * Ensure that the user's JWT has valid data.
          // * ================================================
          if (
            authUser.id === undefined ||
            authUser.username === undefined ||
            authUser.role === undefined
          ) {
            set.status = 401;
            return;
          }
          // * ================================================
          // * Check user existence and respond with user data.
          // * ================================================
          try {
            const user = await prisma.user.findUnique({
              where: {
                id: authUser.id,
                username: authUser.username,
                role: authUser.role,
              },
            });
            if (!user) {
              set.status = 404;
              return { message: 'User not found' };
            }
            return {
              data: {
                user,
              },
            };
          } catch (error) {
            console.error('Failed to retrieve user:', error);
            set.status = 500;
          }
        },
        {
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
          },
        }
      );

    return app;
  });

  return app;
};
