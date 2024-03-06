import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Delete a post by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const deletePost = (prisma: PrismaClient) => {
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
        .use(cookie())
        .delete(
          '/posts/:id',
          async ({ params: { id }, jwt, set, cookie: { auth } }) => {
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
            // * Verify the user deleting the post is the author.
            // * ================================================
            try {
              const post = await prisma.post.findUnique({
                where: {
                  id,
                },
                select: {
                  userId: true,
                },
              });
              if (user.id !== post?.userId) {
                set.status = 401;
                return;
              }
            } catch (error) {
              console.error('Failed retrieve the post:', error);
              set.status = 500;
              return;
            }
            // * ================================================
            // * Delete the post from the database.
            // * ================================================
            try {
              await prisma.post.delete({
                where: {
                  id: id,
                },
              });
              set.status = 202;
              return;
            } catch (error) {
              console.error('Failed to delete post:', error);
              set.status = 500;
            }
          },
          {
            detail: {
              tags: ['Posts'],
              // OpenAPIV3.ResponsesObject
              responses: {
                202: {
                  description: 'Post deleted successfully',
                },
                400: {
                  description: 'User not authenticated',
                },
                401: {
                  description: 'User not authorized',
                },
                500: {
                  description: 'An unexpected error occurred',
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
