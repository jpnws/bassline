import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Retrieve a single user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.get(
    '/users/:id',
    async ({ params: { id }, set }) => {
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
    },
    {
      detail: {
        tags: ['Users'],
      },
    }
  );

  return app;
};
