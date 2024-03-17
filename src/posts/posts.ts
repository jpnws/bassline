import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';
import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';

import { createPost } from 'src/posts/routes/createPost';
import { deletePost } from 'src/posts/routes/deletePost';
import { getPost } from 'src/posts/routes/getPost';
import { getPostComments } from 'src/posts/routes/getPostComments';
import { updatePost } from 'src/posts/routes/updatePost';

import PostRepository from 'src/posts/PostRepository';
import PostService from 'src/posts/PostService';
import PostController from 'src/posts/PostController';

/**
 * Posts routes.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const posts = (prisma: PrismaClient) => {
  const app = new Elysia();

  const postRepository = new PostRepository(prisma);
  const postService = new PostService(postRepository);
  const postController = new PostController(postService);

  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.APP_JWT_SECRET,
      }),
    )
    .use(bearer())
    .derive(async ({ jwt, bearer }) => {
      const currentUser = (await jwt.verify(bearer)) as UserBody;
      return { currentUser };
    })
    .guard(
      {
        beforeHandle({ currentUser, bearer, set }) {
          if (!bearer) {
            set.status = 400;
            return {
              error: 'User Not Authenticated',
              message: 'Authentication token was missing.',
            };
          }
          if (!currentUser) {
            set.status = 401;
            return {
              error: 'User Unauthorized',
              message: 'Authentication token was missing or incorrect',
            };
          }
        },
      },
      (app) =>
        app
          .use(createPost(postController))
          .use(updatePost(postController))
          .use(deletePost(postController)),
    )
    .use(getPost(postController))
    .use(getPostComments(postController));

  return app;
};
