import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Boards board posts.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getBoardPosts = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.get(
    '/boards/:id/posts',
    async ({ params: { id }, set }) => {
      try {
        const board = await prisma.board.findUnique({
          where: {
            id: parseInt(id),
          },
          select: {
            id: true,
            name: true,
            posts: {
              select: {
                id: true,
                subject: true,
                createdAt: true,
                updatedAt: true,
                author: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        });
        set.status = 200;
        return {
          data: {
            board,
          },
        };
      } catch (error) {
        console.error('Failed to retrieve posts:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Boards'],
        // OpenAPIV3.ResponsesObject
        responses: {
          200: {
            description: 'Retrieved posts associated with board',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        board: {
                          type: 'object',
                          properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            posts: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                  subject: { type: 'string' },
                                  createdAt: { type: 'string' },
                                  updatedAt: { type: 'string' },
                                  author: {
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
                  },
                },
              },
            },
          },
        },
      },
    }
  );

  return app;
};
