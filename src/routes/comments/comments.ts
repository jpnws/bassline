import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

export const comments = (prisma: PrismaClient) => {
  const app = new Elysia();

  /**
   * Create a new comment.
   */
  app.post('/comments', async ({ body, set }) => {
    const { text, postId, userId } = body as CommentBody;
    try {
      const comment = await prisma.comment.create({
        data: {
          text,
          postId,
          userId,
        },
      });
      set.status = 201;
      return comment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      set.status = 500;
    }
  });

  /**
   * Update an existing comment by its ID.
   */
  app.put('/comments/:id', async ({ params: { id }, body, set }) => {
    const { text, postId, userId } = body as CommentBody;
    try {
      const comment = await prisma.comment.update({
        where: {
          id: parseInt(id),
        },
        data: {
          text,
          postId,
          userId,
        },
      });
      set.status = 200;
      return comment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      set.status = 500;
    }
  });

  /**
   * Delete a comment by its ID.
   */
  app.delete('/comments/:id', async ({ params: { id }, set }) => {
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
  });

  return app;
};
