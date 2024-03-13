import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { createUser } from 'src/users/routes/createUser';
import { deleteUser } from 'src/users/routes/deleteUser';
import { getCurrentUser } from 'src/users/routes/getCurrentUser';
import { getUser } from 'src/users/routes/getUser';
import { updateUser } from 'src/users/routes/updateUser';

/**
 * Users routes.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const users = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.use(createUser(prisma));
  app.use(getUser(prisma));
  app.use(updateUser(prisma));
  app.use(deleteUser(prisma));
  app.use(getCurrentUser(prisma));

  return app;
};
