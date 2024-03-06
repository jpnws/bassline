import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Create a new post.
 * POST /posts.
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
            secret: Bun.env.APP_JWT_SECRET,
          })
        )
        .use(cookie())
        .post(
          '/posts',
          async ({ body, set }) => {
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
              return post;
            } catch (error) {
              console.error('Failed to create post:', error);
              set.status = 500;
            }
          },
          {
            detail: {
              tags: ['Posts'],
            },
          }
        );
      return app;
    }
  );

  return app;
};
