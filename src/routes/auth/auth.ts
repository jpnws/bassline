import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { signup } from 'src/routes/auth/signup';
import { signin } from 'src/routes/auth/signin';
import { signout } from 'src/routes/auth/signout';

/**
 * Auth route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const auth = (prisma: PrismaClient) => {
  const app = new Elysia({ prefix: '/auth' });

  app.use(signup(prisma));

  app.use(signin(prisma));

  app.use(signout());

  return app;
};
