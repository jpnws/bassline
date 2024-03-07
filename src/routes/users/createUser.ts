import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

/**
 * Create a new user.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const createUser = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.post(
    '/users',
    async ({ body, set }) => {
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
    },
    {
      detail: {
        tags: ['Users'],
      },
    }
  );

  return app;
};
