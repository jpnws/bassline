import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

/**
 * Update an existing comment by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const updateComment = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
    (app) => {
      app
        .use(
          jwt({
            name: 'jwt',
            secret: process.env.APP_JWT_SECRET,
          })
        )
        .use(bearer())
        .put(
          '/comments/:id',
          async ({ params: { id }, body, jwt, set, bearer }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!bearer) {
              set.status = 400;
              return {
                error: 'User not authenticated',
                message: 'Authentication token was missing.',
              };
            }
            // * ================================================
            // * Verify the user's JWT.
            // * ================================================
            const user = (await jwt.verify(bearer)) as UserBody;
            if (!user) {
              set.status = 401;
              return {
                error: 'User unauthorized',
                message: 'Authentication token was missing or incorrect',
              };
            }
            // * ================================================
            // * Extract the comment data from the request body.
            // * ================================================
            const { text, postId, authorId } = JSON.parse(
              body as string
            ) as CommentBody;
            // * ================================================
            // * Verify user updating comment is author or admin.
            // * ================================================
            if (user.id !== authorId && user.role !== 'ADMIN') {
              set.status = 401;
              return {
                error: 'Unauthorized',
                message: 'User is not the author of the comment.',
              };
            }
            // * ================================================
            // * Update the comment in the database.
            // * ================================================
            try {
              await prisma.comment.update({
                where: {
                  id,
                },
                data: {
                  text,
                  postId,
                  authorId,
                },
              });
              set.status = 200;
            } catch (error) {
              console.error('Failed to update comment:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to update comment.',
              };
            }
          },
          {
            detail: {
              tags: ['Comments'],
              responses: {
                200: {
                  description: 'Comment Updated',
                },
                400: {
                  description: 'User Not Authenticated',
                },
                401: {
                  description: 'User Not Authorized',
                },
                500: {
                  description: 'Internal Server Error',
                },
              },
            },
          }
        );

      return app;
    }
  );

  return app;
};
