import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Retrieve all comments by post ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getPostComments = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.get(
    '/posts/:id/comments',
    async ({ params: { id }, set }) => {
      try {
        const comments = await prisma.comment.findMany({
          where: {
            postId: parseInt(id),
          },
        });
        set.status = 200;
        return comments;
      } catch (error) {
        console.error('Failed to retrieve comments:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Posts'],
      },
    }
  );

  return app;
};
