import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Retrieve all boards.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getBoards = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.get(
    '/boards',
    async ({ set }) => {
      try {
        const boards = await prisma.board.findMany();
        set.status = 200;
        return {
          data: {
            boards,
          },
        };
      } catch (error) {
        console.error('Failed to retrieve boards:', error);
        set.status = 500;
        return {
          error: 'Internal Server Error',
          message: 'Failed to retrieve boards.',
        };
      }
    },
    {
      detail: {
        tags: ['Boards'],
        // OpenAPIV3.ResponsesObject
        responses: {
          200: {
            description: 'Retrieved All Boards',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        boards: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              name: { type: 'string' },
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
};
