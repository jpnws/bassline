import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { createUser } from 'src/routes/users/createUser';
import { deleteUser } from 'src/routes/users/deleteUser';
import { getUser } from 'src/routes/users/getUser';
import { updateUser } from 'src/routes/users/updateUser';

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

  return app;
};
