import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

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
        userId: t.Numeric(),
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
        .use(cookie())
        .put(
          '/comments/:id',
          async ({ params: { id }, body, jwt, set, cookie: { auth } }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!auth) {
              set.status = 400;
              return;
            }
            // * ================================================
            // * Verify the user's JWT.
            // * ================================================
            const user = (await jwt.verify(auth)) as UserBody;
            if (!user) {
              set.status = 401;
              return;
            }
            // * ================================================
            // * Extract the post data from the request body.
            // * ================================================
            const { text, postId, userId } = body as CommentBody;
            // * ================================================
            // * Verify the user updating the comment is author.
            // * ================================================
            if (user.id !== userId) {
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
                  userId,
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
              tags: ['Posts'],
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
