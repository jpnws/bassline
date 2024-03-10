import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';

/**
 * Retrieve all comments by post ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getPostComments = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
    (app) => {
      app.get(
        '/posts/:id/comments',
        async ({ params: { id }, set }) => {
          try {
            const post = await prisma.post.findUnique({
              where: {
                id,
              },
              select: {
                id: true,
                comments: {
                  select: {
                    id: true,
                    text: true,
                    author: {
                      select: {
                        id: true,
                        username: true,
                      },
                    },
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            });
            set.status = 200;
            return {
              data: {
                post,
              },
            };
          } catch (error) {
            console.error('Failed to retrieve comments:', error);
            set.status = 500;
            return {
              error: 'Internal Server Error',
              message: 'Failed to retrieve comments.',
            };
          }
        },
        {
          detail: {
            tags: ['Posts'],
            // OpenAPIV3.ResponsesObject
            responses: {
              200: {
                description: 'Comments Retrieved',
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
                                comments: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'number' },
                                      text: { type: 'string' },
                                      author: {
                                        type: 'object',
                                        properties: {
                                          id: { type: 'number' },
                                          username: { type: 'string' },
                                        },
                                      },
                                      createdAt: { type: 'string' },
                                      updatedAt: { type: 'string' },
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
                },
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
