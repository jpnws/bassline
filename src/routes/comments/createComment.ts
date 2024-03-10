import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

/**
 * Create a new comment.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const createComment = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
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
        .post(
          '/comments',
          async ({ body, jwt, set, bearer }) => {
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
            // * Extract the data from the request body.
            // * ================================================
            const { text, postId, authorId } = body as CommentBody;
            // * ================================================
            // * Verify that the user updating is the author.
            // * ================================================
            if (user.id !== authorId) {
              set.status = 401;
              return {
                error: 'Unauthorized',
                message: 'User is not the author of the comment.',
              };
            }
            // * ================================================
            // * Create a new comment.
            // * ================================================
            try {
              const comment = await prisma.comment.create({
                data: {
                  text,
                  postId,
                  authorId,
                },
                select: {
                  id: true,
                },
              });
              set.status = 201;
              return {
                data: {
                  comment: {
                    id: comment.id,
                  },
                },
              };
            } catch (error) {
              console.error('Failed to create comment:', error);
              set.status = 500;
              return {
                error: 'Internal Server Error',
                message: 'Failed to create the comment.',
              };
            }
          },
          {
            detail: {
              tags: ['Comments'],
              // OpenAPIV3.ResponsesObject
              responses: {
                201: {
                  description: 'Comment Created',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              comment: {
                                type: 'object',
                                properties: {
                                  id: { type: 'number' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                400: {
                  description: 'User Not Authenticated',
                },
                401: {
                  description: 'User Unauthorized',
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
