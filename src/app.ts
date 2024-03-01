import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';

type Postbody = {
  id: string;
  subject: string;
  text: string;
  boardId: number;
  userId: number;
};

export const createApp = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.get('/boards/:id/posts', async ({ params: { id } }) => {
    try {
      return await prisma.post.findMany({
        where: {
          boardId: parseInt(id),
        },
      });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  });

  app.get('/posts/:id', ({ params: { id } }) => {
    try {
      return prisma.post.findUnique({
        where: {
          id: parseInt(id),
        },
      });
    } catch (error) {
      console.error('Failed to fetch post:', error);
    }
  });

  app.post('/posts', async ({ body }) => {
    const { subject, text, boardId, userId } = body as Postbody;
    try {
      return await prisma.post.create({
        data: {
          subject,
          text,
          board: {
            connect: {
              id: boardId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  });

  app.put('/posts/:id', ({ body }) => {
    const { id, subject, text } = body as Postbody;
    try {
      return prisma.post.update({
        where: {
          id: parseInt(id),
        },
        data: {
          subject,
          text,
        },
      });
    } catch (error) {
      console.error('Failed to update post:', error);
    }
  });

  app.delete('/posts/:id', ({ params: { id } }) => {
    try {
      return prisma.post.delete({
        where: {
          id: parseInt(id),
        },
      });
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  });

  return app;
};
