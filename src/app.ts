import { Elysia, t } from 'elysia';
import { PrismaClient } from '@prisma/client';
import jwt from '@elysiajs/jwt';
import cookie from '@elysiajs/cookie';

/**
 * Creates an instance of the Elysia app and defines various routes for handling HTTP requests.
 *
 * @param prisma - The Prisma client instance.
 * @param swagger - The Swagger plugin instance.
 * @param cors - The CORS plugin instance.
 * @returns The Elysia app instance.
 */
export const createApp = (prisma: PrismaClient, swagger?: any, cors?: any) => {
  const app = new Elysia();

  // Add the Swagger plugin to the app.
  if (swagger) {
    app.use(swagger());
  }

  // Add CORS to allow requests from any origin.
  if (cors) {
    app.use(cors());
  }

  /**
   * API health check.
   */
  app.get('/health_check', ({ set }) => {
    set.status = 200;
  });

  /**
   * Retrieve all boards.
   */
  app.get('/boards', async ({ set }) => {
    try {
      const boards = await prisma.board.findMany();
      set.status = 200;
      return boards;
    } catch (error) {
      console.error('Failed to retrieve boards:', error);
      set.status = 500;
    }
  });

  /**
   * Create a new board.
   */
  app.post('/boards', async ({ body, set }) => {
    const { name } = body as { name: string };
    try {
      const board = await prisma.board.create({
        data: {
          name,
        },
      });
      set.status = 201;
      return board;
    } catch (error) {
      console.error('Failed to create board:', error);
      set.status = 500;
    }
  });

  /**
   * Retrieve all posts corresponding to a specific board ID.
   */
  app.get('/boards/:id/posts', async ({ params: { id }, set }) => {
    try {
      const posts = await prisma.post.findMany({
        where: {
          boardId: parseInt(id),
        },
      });
      set.status = 200;
      return posts;
    } catch (error) {
      console.error('Failed to retrieve posts:', error);
      set.status = 500;
    }
  });

  /**
   * Retrieve a single post by its ID.
   */
  app.get('/posts/:id', async ({ params: { id }, set }) => {
    try {
      const post = await prisma.post.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (!post) {
        set.status = 404;
        return { message: 'Post not found' };
      }
      set.status = 200;
      return post;
    } catch (error) {
      console.error('Failed to retrieve post:', error);
      set.status = 500;
    }
  });

  /**
   * Create a new post.
   */
  app.post('/posts', async ({ body, set }) => {
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
  });

  /**
   * Update an existing post by its ID.
   */
  app.put('/posts/:id', async ({ params: { id }, body, set }) => {
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
  });

  /**
   * Delete a post by its ID.
   */
  app.delete('/posts/:id', async ({ params: { id }, set }) => {
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
  });

  /**
   * Create a new user.
   */
  app.post('/users', async ({ body, set }) => {
    const { username, password } = body as {
      username: string;
      password: string;
    };
    try {
      const user = await prisma.user.create({
        data: {
          username,
          hash: await Bun.password.hash(password),
        },
      });
      set.status = 201;
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
      set.status = 500;
    }
  });

  /**
   * Create a new comment.
   */
  app.post('/comments', async ({ body, set }) => {
    const { text, postId, userId } = body as CommentBody;
    try {
      const comment = await prisma.comment.create({
        data: {
          text,
          postId,
          userId,
        },
      });
      set.status = 201;
      return comment;
    } catch (error) {
      console.error('Failed to create comment:', error);
      set.status = 500;
    }
  });

  /**
   * Update an existing comment by its ID.
   */
  app.put('/comments/:id', async ({ params: { id }, body, set }) => {
    const { text, postId, userId } = body as CommentBody;
    try {
      const comment = await prisma.comment.update({
        where: {
          id: parseInt(id),
        },
        data: {
          text,
          postId,
          userId,
        },
      });
      set.status = 200;
      return comment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      set.status = 500;
    }
  });

  /**
   * Retrieve all comments by post ID.
   */
  app.get('/posts/:id/comments', async ({ params: { id }, set }) => {
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
  });

  /**
   * Delete a comment by its ID.
   */
  app.delete('/comments/:id', async ({ params: { id }, set }) => {
    try {
      await prisma.comment.delete({
        where: {
          id: parseInt(id),
        },
      });
      set.status = 202;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      set.status = 500;
    }
  });

  /**
   * Retrieve a single user by its ID.
   */
  app.get('/users/:id', async ({ params: { id }, set }) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (!user) {
        set.status = 404;
        return { message: 'User not found' };
      }
      return user;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      set.status = 500;
    }
  });

  /**
   * Update an existing user by its ID.
   */
  app.put('/users/:id', async ({ params: { id }, body, set }) => {
    const { username } = body as {
      username: string;
    };
    try {
      const user = await prisma.user.update({
        where: {
          id: parseInt(id),
        },
        data: {
          username,
        },
      });
      set.status = 200;
      return user;
    } catch (error) {
      console.error('Failed to update user:', error);
      set.status = 500;
    }
  });

  /**
   * Delete a user by its ID.
   */
  app.delete('/users/:id', async ({ params: { id }, set }) => {
    try {
      await prisma.user.delete({
        where: {
          id: parseInt(id),
        },
      });
      set.status = 202;
    } catch (error) {
      console.error('Failed to delete user:', error);
      set.status = 500;
    }
  });

  app.group(
    '/auth',
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
    (app) =>
      app
        .use(
          jwt({
            name: 'jwt',
            secret: Bun.env.JWT_SECRET,
          })
        )
        .use(cookie())
        .post('/signup', async ({ body, set, jwt, setCookie }) => {
          const { username, password } = body;
          // * ================================================
          // * Check if username or password is empty.
          // * ================================================
          if (!username || !password) {
            set.status = 400;
            return {
              message: 'Username or password cannot be empty.',
            };
          }
          // * ================================================
          // * Check for existing user.
          // * ================================================
          try {
            const userExists = await prisma.user.findUnique({
              where: {
                username,
              },
              select: {
                id: true,
              },
            });
            if (userExists) {
              set.status = 400;
              return {
                message: 'Username already in use.',
              };
            }
          } catch (error) {
            console.error('Failed to find the user:', error);
            set.status = 500;
            return {
              message: 'Server error. Unable process the request.',
            };
          }

          try {
            // * ================================================
            // * Hash the password.
            // * ================================================
            const hash = await Bun.password.hash(password);
            // * ================================================
            // * Save the user to the database.
            // * ================================================
            const user = await prisma.user.create({
              data: {
                username,
                hash,
              },
              select: {
                id: true,
                username: true,
              },
            });
            // * ================================================
            // * Store JWT in a cookie.
            // * ================================================
            setCookie(
              'Authorization',
              await jwt.sign({ id: user.id, username: user.username }),
              {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
                secure: Bun.env.NODE_ENV === 'production',
              }
            );
            set.status = 201;
          } catch (error) {
            console.log('Failed to create a new user:', error);
            set.status = 500;
            return {
              message: 'Server error. Unable to create an account.',
            };
          }
        })
        .post('/signin', ({ body }) => {
          const { username, password } = body as {
            username: string;
            password: string;
          };
          console.log(username, password);
        })
        .post('/logout', ({ body }) => {
          const { username, password } = body as {
            username: string;
            password: string;
          };
          console.log(username, password);
        })
  );

  return app;
};
