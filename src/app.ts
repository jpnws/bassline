import { Elysia } from 'elysia';
import { PrismaClient } from '@prisma/client';

/**
 * Creates an instance of the Elysia app and defines various routes for handling HTTP requests.
 *
 * @param prisma - The PrismaClient instance used for interacting with the database.
 * @returns The configured Elysia app instance.
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
   * Retrieves all boards.
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
   * Creates a new board.
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
   * Retrieves all posts corresponding to a specific board ID.
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
   * Retrieves a single post by its ID.
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
   * Creates a new post.
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
   * Updates an existing post by its ID.
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
   * Deletes a post by its ID.
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
    }
  });

  /**
   * Creates a new user.
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
          password,
        },
      });
      set.status = 201;
      return user;
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  });

  /**
   * Creates a new comment.
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
   * Updates an existing comment by its ID.
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
   * Deletes a comment by its ID.
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
    }
  });

  return app;
};
