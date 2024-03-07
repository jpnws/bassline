import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

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
        .use(cookie())
        .post(
          '/comments',
          async ({ body, jwt, set, cookie: { auth } }) => {
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
            // * Extract the data from the request body.
            // * ================================================
            const { text, postId, authorId } = body as CommentBody;
            // * ================================================
            // * Verify that the user updating is the author.
            // * ================================================
            if (user.id !== authorId) {
              set.status = 401;
              return;
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
            }
          },
          {
            detail: {
              tags: ['Comments'],
              // OpenAPIV3.ResponsesObject
              responses: {
                201: {
                  description: 'Comment created',
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
                  description: 'Bad request',
                },
                401: {
                  description: 'Unauthorized',
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
