import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Retrieve a single comment by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getComment = (prisma: PrismaClient) => {
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
          '/comments/:id',
          async ({ params: { id }, jwt, set, cookie: { auth } }) => {
            try {
              // * ================================================
              // * Query the requested comment.
              // * ================================================
              const comment = await prisma.comment.findUnique({
                where: {
                  id,
                },
                select: {
                  id: true,
                  text: true,
                  createdAt: true,
                  updatedAt: true,
                  post: {
                    select: {
                      id: true,
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
              if (!comment) {
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
                      comment: {
                        ...comment,
                        user: {
                          ...comment.user,
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
                    comment: {
                      ...comment,
                      user: {
                        ...comment.user,
                        isAuthor: user.id === comment.user.id,
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
                  comment: {
                    ...comment,
                    user: {
                      ...comment.user,
                      isAuthor: false,
                      isAdmin: false,
                    },
                  },
                },
              };
            } catch (error) {
              console.error('Failed to retrieve comment:', error);
              set.status = 500;
              return {
                status: 'error',
                message: 'Failed to retrieve comment',
              };
            }
          },
          {
            detail: {
              tags: ['Comments'],
              // OpenAPIV3.ResponsesObject
              responses: {
                200: {
                  description: 'Comment retrieved',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              comment: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  text: { type: 'string' },
                                  createdAt: { type: 'string' },
                                  updatedAt: { type: 'string' },
                                  post: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'number' },
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
                  description: 'Comment not found',
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
