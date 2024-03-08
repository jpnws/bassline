import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Signup route.
 *
 * This route is used to create a new user account. It checks if the user is
 * already authenticated. If not, it checks if the username or password is
 * empty. If not, it checks if the username is already in use. If not, it hashes
 * the password and saves the user to the database. Finally, it stores the JWT
 * in a cookie.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const signup = (prisma: PrismaClient) => {
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
          '/signup',
          async ({ body, set, jwt, cookie: { auth } }) => {
            // * ================================================
            // * Check if user is already authenticated.
            // * ================================================
            if (auth) {
              set.status = 409;
              return {
                message: 'You are already authenticated.',
              };
            }
            const { username, password } = body;
            // * ================================================
            // * Check if username or password is empty.
            // * ================================================
            if (!username || !password) {
              set.status = 400;
              return {
                message: 'Username or password cannot be empty.',
              };
            }
            // * ================================================
            // * Check for existing user.
            // * ================================================
            try {
              const userExists = await prisma.user.findUnique({
                where: {
                  username,
                },
                select: {
                  id: true,
                },
              });
              if (userExists) {
                set.status = 400;
                return {
                  message: 'Username already in use.',
                };
              }
            } catch (error) {
              console.error('Failed to find the user:', error);
              set.status = 500;
              return {
                message: 'Server error. Unable process the request.',
              };
            }

            try {
              // * ================================================
              // * Hash the password.
              // * ================================================
              const hash = await Bun.password.hash(password);
              // * ================================================
              // * Save the user to the database.
              // * ================================================
              const user = await prisma.user.create({
                data: {
                  username,
                  hash,
                },
                select: {
                  id: true,
                  username: true,
                  role: true,
                },
              });
              // * ================================================
              // * Generate a JWT and send it in the response.
              // * ================================================
              const token = await jwt.sign({
                id: user.id,
                username: user.username,
                role: user.role,
              });
              set.status = 201;
              return {
                data: {
                  user: {
                    id: user.id,
                  },
                  token,
                },
              };
            } catch (error) {
              console.log('Failed to create a new user:', error);
              set.status = 500;
              return {
                message: 'Server error. Unable to create an account.',
              };
            }
          },
          {
            detail: {
              tags: ['Auth'],
              // OpenAPIV3.ResponsesObject
              responses: {
                201: {
                  description: 'User created successfully.',
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
                400: {
                  description: 'Username or password cannot be empty.',
                },
                409: {
                  description: 'User already authenticated.',
                },
                500: {
                  description: 'Server error. Unable to create an account.',
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
