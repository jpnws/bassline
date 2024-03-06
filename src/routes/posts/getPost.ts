import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Retrieve a single post by its ID.
 *
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const getPost = (prisma: PrismaClient) => {
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
        .get(
          '/posts/:id',
          async ({ params: { id }, jwt, set, cookie: { auth } }) => {
            try {
              // * ================================================
              // * Query the requested post.
              // * ================================================
              const post = await prisma.post.findUnique({
                where: {
                  id,
                },
                select: {
                  id: true,
                  userId: true,
                  subject: true,
                  text: true,
                  createdAt: true,
                  updatedAt: true,
                  board: {
                    select: {
                      name: true,
                    },
                  },
                  user: {
                    select: {
                      username: true,
                    },
                  },
                },
              });
              if (!post) {
                set.status = 404;
                return { message: 'Post not found' };
              }
              const postUserId = post.userId;
              const resPost = {
                id: post.id,
                subject: post.subject,
                text: post.text,
                boardName: post.board.name,
                username: post.user.username,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
              };
              set.status = 200;
              if (auth) {
                // * ================================================
                // * Verify the user's JWT.
                // * ================================================
                const user = (await jwt.verify(auth)) as UserBody;
                if (!user) {
                  // * ================================================
                  // * Respond with ordinary payload when unauthorized.
                  // * ================================================
                  return {
                    data: {
                      post: resPost,
                      user: {
                        isAuthor: false,
                        isAdmin: false,
                      },
                    },
                  };
                }
                // * ================================================
                // * Respond with payload for registered member.
                // * ================================================
                return {
                  data: {
                    post: resPost,
                    user: {
                      isAuthor: user.id === postUserId,
                      isAdmin: user.role === 'ADMIN',
                    },
                  },
                };
              }
              // * ================================================
              // * Respond with ordinary payload for anon user.
              // * ================================================
              return {
                data: {
                  post: resPost,
                  user: {
                    isAuthor: false,
                    isAdmin: false,
                  },
                },
              };
            } catch (error) {
              console.error('Failed to retrieve post:', error);
              set.status = 500;
              return {
                status: 'error',
                message: 'Failed to retrieve post',
              };
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
