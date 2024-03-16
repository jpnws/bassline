import bearer from '@elysiajs/bearer';
import jwt from '@elysiajs/jwt';
import { PrismaClient } from '@prisma/client';
import { Elysia } from 'elysia';

import { createComment } from 'src/comments/routes/createComment';
import { deleteComment } from 'src/comments/routes/deleteComment';
import { getComment } from 'src/comments/routes/getComment';
import { updateComment } from 'src/comments/routes/updateComment';

import CommentRepository from 'src/comments/CommentRepository';
import CommentService from 'src/comments/CommentService';
import CommentController from 'src/comments/CommentController';

/**
 * Comments routes.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const comments = (prisma: PrismaClient) => {
  const app = new Elysia();

  const commentRepository = new CommentRepository(prisma);
  const commentService = new CommentService(commentRepository);
  const commentController = new CommentController(commentService);

  app
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.APP_JWT_SECRET,
      })
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
          .use(createComment(commentController))
          .use(updateComment(commentController))
          .use(deleteComment(commentController))
    )
    .use(getComment(commentController));

  return app;
};
