import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

/**
 * Delete a comment by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const deleteComment = (prisma: PrismaClient) => {
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
        .delete(
          '/comments/:id',
          async ({ params: { id }, jwt, set, bearer }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!bearer) {
              set.status = 400;
              return {
                error: 'User Not Authenticated',
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
                error: 'User Unauthorized',
                message: 'Authentication toekn was missing or incorrect',
              };
            }
            // * ================================================
            // * Verify user deleting comment is author or admin.
            // * ================================================
            try {
              const comment = await prisma.comment.findUnique({
                where: {
                  id,
                },
                select: {
                  authorId: true,
                },
              });
              if (user.id !== comment?.authorId && user.role !== 'ADMIN') {
                set.status = 401;
                return;
              }
            } catch (error) {
              console.error('Failed retrieve the comment:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to retrieve the comment.',
              };
            }
            // * ================================================
            // * Delete the comment from the database.
            // * ================================================
            try {
              await prisma.comment.delete({
                where: {
                  id: id,
                },
              });
              set.status = 202;
              return {
                message: 'Comment deleted successfully.',
              };
            } catch (error) {
              console.error('Failed to delete comment:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to delete the comment.',
              };
            }
          },
          {
            detail: {
              tags: ['Comments'],
              // OpenAPIV3.ResponsesObject
              responses: {
                202: {
                  description: 'Comment Deleted',
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
