import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';
import { createComment } from 'src/routes/comments/createComment';
import { getComment } from 'src/routes/comments/getComment';
import { updateComment } from 'src/routes/comments/updateComment';

/**
 * Comments route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const comments = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.use(createComment(prisma));
  app.use(getComment(prisma));
  app.use(updateComment(prisma));

  /**
   * Delete a comment by its ID.
   */
  app.delete(
    '/comments/:id',
    async ({ params: { id }, set }) => {
      try {
        await prisma.comment.delete({
          where: {
            id: parseInt(id),
          },
        });
        set.status = 202;
      } catch (error) {
        console.error('Failed to delete comment:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Comments'],
      },
    }
  );

  return app;
};
