import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Create a new board.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const createBoard = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.post(
    '/boards',
    async ({ body, set }) => {
      const { name } = body as { name: string };
      try {
        const board = await prisma.board.create({
          data: {
            name,
          },
        });
        set.status = 201;
        return {
          data: {
            board: {
              id: board.id,
            },
          },
        };
      } catch (error) {
        console.error('Failed to create a board:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Boards'],
        // OpenAPIV3.ResponsesObject
        responses: {
          201: {
            description: 'Board created',
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
            description: 'Server error occurred.',
          },
        },
      },
    }
  );

  return app;
};
