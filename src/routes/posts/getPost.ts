import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Retrieve a single post by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getPost = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
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
        .get(
          '/posts/:id',
          async ({ params: { id }, jwt, set, cookie: { auth } }) => {
            try {
              // * ================================================
              // * Query the requested post.
              // * ================================================
              const post = await prisma.post.findUnique({
                where: {
                  id,
                },
                select: {
                  id: true,
                  subject: true,
                  text: true,
                  createdAt: true,
                  updatedAt: true,
                  board: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  user: {
                    select: {
                      id: true,
                      username: true,
                    },
                  },
                },
              });
              if (!post) {
                set.status = 404;
                return;
              }
              set.status = 200;
              if (auth) {
                // * ================================================
                // * Verify the user's JWT.
                // * ================================================
                const user = (await jwt.verify(auth)) as UserBody;
                if (!user) {
                  // * ================================================
                  // * Respond with ordinary payload when unauthorized.
                  // * ================================================
                  return {
                    data: {
                      post: {
                        ...post,
                        user: {
                          ...post.user,
                          isAuthor: false,
                          isAdmin: false,
                        },
                      },
                    },
                  };
                }
                // * ================================================
                // * Respond with payload for registered member.
                // * ================================================
                return {
                  data: {
                    post: {
                      ...post,
                      user: {
                        ...post.user,
                        isAuthor: user.id === post.user.id,
                        isAdmin: user.role === 'ADMIN',
                      },
                    },
                  },
                };
              }
              // * ================================================
              // * Respond with ordinary payload for anon user.
              // * ================================================
              return {
                data: {
                  post: {
                    ...post,
                    user: {
                      ...post.user,
                      isAuthor: false,
                      isAdmin: false,
                    },
                  },
                },
              };
            } catch (error) {
              console.error('Failed to retrieve post:', error);
              set.status = 500;
              return {
                status: 'error',
                message: 'Failed to retrieve post',
              };
            }
          },
          {
            detail: {
              tags: ['Posts'],
              // OpenAPIV3.ResponsesObject
              responses: {
                200: {
                  description: 'Post retrieved',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              post: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  subject: { type: 'string' },
                                  text: { type: 'string' },
                                  createdAt: { type: 'string' },
                                  updatedAt: { type: 'string' },
                                  board: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'number' },
                                      name: { type: 'string' },
                                    },
                                  },
                                  author: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'number' },
                                      username: { type: 'string' },
                                    },
                                  },
                                },
                              },
                              currentUser: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  username: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                404: {
                  description: 'Post not found',
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
