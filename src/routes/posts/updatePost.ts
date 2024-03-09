import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

/**
 * Update an existing post by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const updatePost = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
      body: t.Object({
        subject: t.String(),
        text: t.String(),
        boardId: t.Numeric(),
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
          '/posts/:id',
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
            // * Extract the post data from the request body.
            // * ================================================
            const { subject, text, boardId, authorId } = body as PostBody;
            // * ================================================
            // * Verify the user updating is the author.
            // * ================================================
            if (user.id !== authorId) {
              set.status = 401;
              return;
            }
            // * ================================================
            // * Update the post in the database.
            // * ================================================
            try {
              await prisma.post.update({
                where: {
                  id,
                },
                data: {
                  subject,
                  text,
                  boardId,
                  authorId,
                },
              });
              set.status = 200;
            } catch (error) {
              console.error('Failed to update post:', error);
              set.status = 500;
            }
          },
          {
            detail: {
              tags: ['Posts'],
              // OpenAPIV3.ResponsesObject
              responses: {
                200: {
                  description: 'Post updated successfully',
                },
                400: {
                  description: 'User not authenticated',
                },
                401: {
                  description: 'User not authorized',
                },
                500: {
                  description: 'Failed to update post',
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
