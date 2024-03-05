import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

import { boards } from 'src/routes/boards/boards';
import { posts } from 'src/routes/posts/posts';
import { users } from 'src/routes/users/users';
import { comments } from 'src/routes/comments/comments';
import { auth } from 'src/routes/auth/auth';

/**
 * Creates an instance of the Elysia app and defines various routes for handling HTTP requests.
 *
 * @param prisma - The Prisma client instance.
 * @param swagger - The Swagger plugin instance.
 * @param cors - The CORS plugin instance.
 * @returns The Elysia app instance.
 */
export const createApp = (prisma: PrismaClient, swagger?: any, cors?: any) => {
  const app = new Elysia({ prefix: '/api' });

  // Add the Swagger plugin to the app.
  if (swagger) {
    app.use(swagger());
  }

  // Add CORS to allow requests from any origin.
  if (cors) {
    app.use(cors());
  }

  app.get('/health_check', ({ set }) => {
    set.status = 200;
  });

  app.use(boards(prisma));
  app.use(posts(prisma));
  app.use(users(prisma));
  app.use(comments(prisma));
  app.use(auth(prisma));

  return app;
};
