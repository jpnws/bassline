import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

import { boards } from 'src/routes/boards';
import { posts } from 'src/routes/posts';
import { users } from 'src/routes/users';
import { comments } from 'src/routes/comments';
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
    app.use(
      swagger({
        documentation: {
          info: {
            title: 'Disco API',
            version: '1.0.0',
            description: 'Documentation for the Disco API.',
          },
          tags: [
            { name: 'Boards', description: 'Boards API' },
            { name: 'Posts', description: 'Posts API' },
            { name: 'Comments', description: 'Comments API' },
            { name: 'Users', description: 'Users API' },
            { name: 'Auth', description: 'Auth API' },
          ],
        },
      })
    );
  }

  // Add CORS to allow requests from any origin.
  if (cors) {
    app.use(cors());
  }

  // Define a health check route.
  app.get('/health_check', ({ set }) => {
    set.status = 200;
  });

  // Define various routes for handling HTTP requests.
  app.use(boards(prisma));
  app.use(posts(prisma));
  app.use(users(prisma));
  app.use(comments(prisma));
  app.use(auth(prisma));

  return app;
};
