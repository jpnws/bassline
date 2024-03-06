import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Delete a post by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const deletePost = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.delete(
    '/posts/:id',
    async ({ params: { id }, set }) => {
      try {
        await prisma.post.delete({
          where: {
            id: parseInt(id),
          },
        });
        set.status = 202;
      } catch (error) {
        console.error('Failed to delete post:', error);
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
