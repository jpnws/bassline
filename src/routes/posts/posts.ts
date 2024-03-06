import { PrismaClient } from '@prisma/client';
import { Elysia, t } from 'elysia';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Posts route.
 * @param prisma - The Prisma client.
 * @returns The Elysia app.
 */
export const posts = (prisma: PrismaClient) => {
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
      /**
       * Retrieve a single post by its ID.
       */
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

  app.group(
    '',
    {
      params: t.Object({
        id: t.Numeric(),
      }),
    },
    (app) => {
      /**
       * Retrieve a single post by its ID.
       */
      app
        .use(
          jwt({
            name: 'jwt',
            secret: Bun.env.APP_JWT_SECRET,
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
                createdAt: post.createdAt,
                boardName: post.board.name,
                username: post.user.username,
              };
              set.status = 200;
              if (auth) {
                // * ================================================
                // * Verify the user's JWT.
                // * ================================================
                const user = (await jwt.verify(auth)) as UserBody;
                if (!user) {
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

  /**
   * Update an existing post by its ID.
   */
  app.put(
    '/posts/:id',
    async ({ params: { id }, body, set }) => {
      const { subject, text, boardId, userId } = body as PostBody;
      try {
        const post = await prisma.post.update({
          where: {
            id: parseInt(id),
          },
          data: {
            subject,
            text,
            boardId,
            userId,
          },
        });
        set.status = 200;
        return post;
      } catch (error) {
        console.error('Failed to update post:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Posts'],
      },
    }
  );

  /**
   * Delete a post by its ID.
   */
  app.delete(
    '/posts/:id',
    async ({ params: { id }, set }) => {
      try {
        await prisma.post.delete({
          where: {
            id: parseInt(id),
          },
        });
        set.status = 202;
      } catch (error) {
        console.error('Failed to delete post:', error);
        set.status = 500;
      }
    },
    {
      detail: {
        tags: ['Posts'],
      },
    }
  );

  /**
   * Retrieve all comments by post ID.
   */
  app.get(
    '/posts/:id/comments',
    async ({ params: { id }, set }) => {
      try {
        const comments = await prisma.comment.findMany({
          where: {
            postId: parseInt(id),
          },
        });
        set.status = 200;
        return comments;
      } catch (error) {
        console.error('Failed to retrieve comments:', error);
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
};
