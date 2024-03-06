import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Update an existing post by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const updatePost = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.put(
    '/posts/:id',
    async ({ params: { id }, body, set }) => {
      const { subject, text, boardId, userId } = body as PostBody;
      try {
        const post = await prisma.post.update({
          where: {
            id: parseInt(id),
          },
          data: {
            subject,
            text,
            boardId,
            userId,
          },
        });
        set.status = 200;
        return post;
      } catch (error) {
        console.error('Failed to update post:', error);
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
