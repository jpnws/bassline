import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { createPost } from 'src/routes/posts/createPost';
import { getPost } from 'src/routes/posts/getPost';
import { updatePost } from 'src/routes/posts/updatePost';
import { deletePost } from 'src/routes/posts/deletePost';
import { getPostComments } from 'src/routes/posts/getPostComments';

/**
 * Posts routes.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const posts = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.use(createPost(prisma));
  app.use(getPost(prisma));
  app.use(updatePost(prisma));
  app.use(deletePost(prisma));
  app.use(getPostComments(prisma));

  return app;
};
