/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { auth } from 'src/auth/auth';
import { boards } from 'src/boards/boards';
import { comments } from 'src/comments/comments';
import { posts } from 'src/posts/posts';
import { users } from 'src/users/users';

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
            title: 'Bassline (Disco API)',
            version: '1.0.0',
            description:
              'Bassline serves as the backend within a project named Disco. Disco is a discussion board (SPA) that offers a basic yet functional platform for users to engage in discussions. Registered members have the capability to create posts and comments, as well as to edit and delete their own content. It also allows its administrators to delete any posts or comments.',
          },
          tags: [
            { name: 'Boards', description: 'Boards API' },
            { name: 'Posts', description: 'Posts API' },
            { name: 'Comments', description: 'Comments API' },
            { name: 'Users', description: 'Users API' },
            { name: 'Auth', description: 'Auth API' },
          ],
        },
      }),
    );
  }

  // Add CORS to allow requests from any origin.
  if (cors) {
    app.use(
      cors({
        methods: ['POST', 'GET', 'PUT', 'DELETE'],
      }),
    );
  }

  // Define a health check route.
  app.get('/health_check', ({ set }) => {
    set.status = 200;
  });

  // Define various routes for handling HTTP requests.
  app
    .use(boards(prisma))
    .use(posts(prisma))
    .use(comments(prisma))
    .use(users(prisma))
    .use(auth(prisma));

  return app;
};
