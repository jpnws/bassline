import { Elysia } from 'elysia';
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

  app.post('/boards', async ({ body, set }) => {
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
  });

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

  app.post('/posts', async ({ body, set }) => {
    const { subject, text, boardId, userId } = body as Postbody;
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

  app.post('/users', async ({ body, set }) => {
    const { username, password } = body as {
      username: string;
      password: string;
    };
    try {
      const user = prisma.user.create({
        data: {
          username,
          password,
        },
      });
      set.status = 201;
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  });

  return app;
};
