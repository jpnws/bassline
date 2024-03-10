import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

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
        .use(bearer())
        .delete(
          '/posts/:id',
          async ({ params: { id }, jwt, set, bearer }) => {
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
                message: 'Authentication toekn was missing or incorrect',
              };
            }
            // * ================================================
            // * Verify the user deleting is the author or admin.
            // * ================================================
            try {
              const post = await prisma.post.findUnique({
                where: {
                  id,
                },
                select: {
                  authorId: true,
                },
              });
              if (user.id !== post?.authorId && user.role !== 'ADMIN') {
                set.status = 401;
                return {
                  error: 'User unauthorized',
                  message: 'User is not authorized to delete the post.',
                };
              }
            } catch (error) {
              console.error('Failed retrieve the post:', error);
              set.status = 500;
              return {
                error: 'Internal server error',
                message: 'Failed to retrieve the post from the database.',
              };
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
              return {
                message: 'Post deleted successfully',
              };
            } catch (error) {
              console.error('Failed to delete post:', error);
              set.status = 500;
              return {
                error: 'Internal server error',
                message: 'Failed to delete the post from the database.',
              };
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
                  description: 'User unauthorized',
                },
                500: {
                  description: 'Internal server error',
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
