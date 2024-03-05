import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

export const users = (prisma: PrismaClient) => {
  const app = new Elysia();

  /**
   * Create a new user.
   */
  app.post('/users', async ({ body, set }) => {
    const { username, password } = body as {
      username: string;
      password: string;
    };
    try {
      const user = await prisma.user.create({
        data: {
          username,
          hash: await Bun.password.hash(password),
        },
      });
      set.status = 201;
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      set.status = 500;
    }
  });

  /**
   * Retrieve a single user by its ID.
   */
  app.get('/users/:id', async ({ params: { id }, set }) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (!user) {
        set.status = 404;
        return { message: 'User not found' };
      }
      return user;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      set.status = 500;
    }
  });

  /**
   * Update an existing user by its ID.
   */
  app.put('/users/:id', async ({ params: { id }, body, set }) => {
    const { username } = body as {
      username: string;
    };
    try {
      const user = await prisma.user.update({
        where: {
          id: parseInt(id),
        },
        data: {
          username,
        },
      });
      set.status = 200;
      return user;
    } catch (error) {
      console.error('Failed to update user:', error);
      set.status = 500;
    }
  });

  /**
   * Delete a user by its ID.
   */
  app.delete('/users/:id', async ({ params: { id }, set }) => {
    try {
      await prisma.user.delete({
        where: {
          id: parseInt(id),
        },
      });
      set.status = 202;
    } catch (error) {
      console.error('Failed to delete user:', error);
      set.status = 500;
    }
  });

  return app;
};
