import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import bearer from '@elysiajs/bearer';

/**
 * Create a new post.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const createPost = (prisma: PrismaClient) => {
  const app = new Elysia();

  app.group(
    '',
    {
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
        .post(
          '/posts',
          async ({ body, jwt, set, bearer }) => {
            // * ================================================
            // * Ensure that the user is already authenticated.
            // * ================================================
            if (!bearer) {
              set.status = 400;
              return {
                error: 'Bearer token is required.',
              };
            }
            // * ================================================
            // * Verify the user's JWT.
            // * ================================================
            const user = (await jwt.verify(bearer)) as UserBody;
            if (!user) {
              set.status = 401;
              return {
                error: 'Invalid JWT.',
              };
            }
            // * ================================================
            // * Extract the data from the request body.
            // * ================================================
            const { subject, text, boardId, authorId } = body as PostBody;
            // * ================================================
            // * Verify that the user creating is the author.
            // * ================================================
            if (user.id !== authorId) {
              set.status = 401;
              return {
                error: 'Unauthorized to create a post.',
              };
            }
            // * ================================================
            // * Create a new post.
            // * ================================================
            try {
              const post = await prisma.post.create({
                data: {
                  subject,
                  text,
                  boardId,
                  authorId,
                },
              });
              set.status = 201;
              return {
                data: {
                  post: {
                    id: post.id,
                  },
                },
              };
            } catch (error) {
              console.error('Failed to create post:', error);
              set.status = 500;
              return {
                error: 'Internal server error.',
              };
            }
          },
          {
            detail: {
              tags: ['Posts'],
              // OpenAPIV3.ResponsesObject
              responses: {
                201: {
                  description: 'Post created',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              post: {
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
