import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Delete a user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const deleteUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.delete(
    '/users/:id',
    async ({ params: { id }, set }) => {
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
    },
    {
      detail: {
        tags: ['Users'],
      },
    }
  );

  return app;
};
