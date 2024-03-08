import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Signin route.
 *
 * This route is used to authenticate a user. It checks if the user is already
 * authenticated. If not, it checks if the username or password is empty. If not
 * empty, it checks if the username exists. If so, it checks if the password is
 * correct. If so, it signs JWT and stores it in a cookie, essentially logging
 * in the user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const signin = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
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
        .use(cookie())
        .post(
          '/signin',
          async ({ body, set, jwt }) => {
            const { username, password } = body;
            // * ================================================
            // * Check if username or password is empty.
            // * ================================================
            if (!username || !password) {
              set.status = 401;
              return;
            }
            // * ================================================
            // * Get user from DB and verify the password.
            // * ================================================
            try {
              const user = await prisma.user.findUnique({
                where: {
                  username,
                },
                select: {
                  id: true,
                  hash: true,
                  role: true,
                },
              });
              if (!user) {
                set.status = 401;
                return;
              }
              const isMatch = await Bun.password.verify(password, user.hash);
              if (!isMatch) {
                set.status = 401;
                return;
              }
              // * ================================================
              // * Generate a JWT and send it in the response.
              // * ================================================
              const token = await jwt.sign({
                id: user.id,
                username: username,
                role: user.role,
              });
              set.status = 200;
              return {
                data: {
                  user: {
                    id: user.id,
                  },
                  token,
                },
              };
            } catch (error) {
              console.error('Failed to sign in user:', error);
              set.status = 500;
              return {
                status: 'error',
                message: 'An unexpected error occurred.',
              };
            }
          },
          {
            detail: {
              tags: ['Auth'],
              // OpenAPIV3.ResponsesObject
              responses: {
                200: {
                  description: 'OK',
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
                                },
                              },
                              token: {
                                type: 'string',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                401: {
                  description: 'Unauthorized',
                },
                500: {
                  description: 'An unexpected error occurred',
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
