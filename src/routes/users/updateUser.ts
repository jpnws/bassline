import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Update an existing user by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const updateUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.put(
    '/users/:id',
    async ({ params: { id }, body, set }) => {
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
    },
    {
      detail: {
        tags: ['Users'],
      },
    }
  );

  return app;
};
