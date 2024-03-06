import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

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
        .post(
          '/posts',
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
            const { subject, text, boardId, userId } = body as PostBody;
            try {
              const post = await prisma.post.create({
                data: {
                  subject,
                  text,
                  boardId,
                  userId,
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
