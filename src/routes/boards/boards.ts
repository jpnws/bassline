import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Boards route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const boards = (prisma: PrismaClient) => {
  const app = new Elysia();

  /**
   * Create a new board.
   */
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
        return board;
      } catch (error) {
        console.error('Failed to create board:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Boards'],
      },
    }
  );

  /**
   * Retrieve all boards.
   */
  app.get(
    '/boards',
    async ({ set }) => {
      try {
        const boards = await prisma.board.findMany();
        set.status = 200;
        return boards;
      } catch (error) {
        console.error('Failed to retrieve boards:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Boards'],
      },
    }
  );

  /**
   * Retrieve all posts corresponding to a specific board ID.
   */
  app.get(
    '/boards/:id/posts',
    async ({ params: { id }, set }) => {
      try {
        const posts = await prisma.post.findMany({
          where: {
            boardId: parseInt(id),
          },
        });
        set.status = 200;
        return posts;
      } catch (error) {
        console.error('Failed to retrieve posts:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Boards'],
      },
    }
  );

  return app;
};
