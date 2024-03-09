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
      body: t.Object({
        text: t.String(),
        postId: t.Numeric(),
        authorId: t.Numeric(),
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
              return;
            }
            // * ================================================
            // * Verify the user's JWT.
            // * ================================================
            const user = (await jwt.verify(bearer)) as UserBody;
            if (!user) {
              set.status = 401;
              return;
            }
            // * ================================================
            // * Extract the comment data from the request body.
            // * ================================================
            const { text, postId, authorId } = body as CommentBody;
            // * ================================================
            // * Verify the user updating the comment is author.
            // * ================================================
            if (user.id !== authorId) {
              set.status = 401;
              return;
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
            }
          },
          {
            detail: {
              tags: ['Comments'],
              // OpenAPIV3.ResponsesObject
              responses: {
                200: {
                  description: 'Comment updated successfully',
                },
                400: {
                  description: 'User not authenticated',
                },
                401: {
                  description: 'User not authorized',
                },
                500: {
                  description: 'Failed to update comment',
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
