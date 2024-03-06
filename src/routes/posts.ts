import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Posts route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const posts = (prisma: PrismaClient) => {
  const app = new Elysia();

  /**
   * Retrieve a single post by its ID.
   */
  app.get(
    '/posts/:id',
    async ({ params: { id }, set }) => {
      try {
        const post = await prisma.post.findUnique({
          where: {
            id: parseInt(id),
          },
        });
        if (!post) {
          set.status = 404;
          return { message: 'Post not found' };
        }
        set.status = 200;
        return post;
      } catch (error) {
        console.error('Failed to retrieve post:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Posts'],
      },
    }
  );

  /**
   * Create a new post.
   */
  app.post(
    '/posts',
    async ({ body, set }) => {
      const { subject, text, boardId, userId } = body as PostBody;
      try {
        const post = await prisma.post.create({
          data: {
            subject,
            text,
            boardId,
            userId,
          },
        });
        set.status = 201;
        return post;
      } catch (error) {
        console.error('Failed to create post:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Posts'],
      },
    }
  );

  /**
   * Update an existing post by its ID.
   */
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

  /**
   * Delete a post by its ID.
   */
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

  /**
   * Retrieve all comments by post ID.
   */
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
