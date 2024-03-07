import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { createComment } from 'src/routes/comments/createComment';
import { getComment } from 'src/routes/comments/getComment';
import { updateComment } from 'src/routes/comments/updateComment';
import { deleteComment } from 'src/routes/comments/deleteComment';

/**
 * Comments route.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const comments = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.use(createComment(prisma));
  app.use(getComment(prisma));
  app.use(updateComment(prisma));
  app.use(deleteComment(prisma));

  return app;
};
