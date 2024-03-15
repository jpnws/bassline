import { AuthorizationError } from 'src/posts/AuthorizationError';
import { IPostService } from 'src/posts/PostService';

interface RouteContext {
  params: { id: number };
  body: {
    subject: string;
    text: string;
    boardId: number;
    authorId: number;
  };
  set: { status: number };
  currentUser: {
    id: number;
    username: string;
    role: string;
  };
}

export default class PostController {
  private postService: IPostService;

  constructor(postService: IPostService) {
    this.postService = postService;
  }

  public createPost = async ({ body, set, currentUser }: RouteContext) => {
    const { subject, text, boardId, authorId } = body;

    try {
      const post = await this.postService.addPost(
        subject,
        text,
        boardId,
        authorId,
        currentUser
      );
      set.status = 201;
      return {
        data: {
          post: {
            id: post.id,
          },
        },
      };
    } catch (error) {
      if (error instanceof AuthorizationError) {
        set.status = 401;
        return {
          error: 'Unauthorized',
          message: error.message,
        };
      }
      console.error('Failed to create the post:', error);
      set.status = 500;
      return {
        error: 'Internal server error',
        message: 'Failed to create the post.',
      };
    }
  };

  public getPostById = async ({ params: { id }, set }: RouteContext) => {
    try {
      const post = await this.postService.getPost(id);
      set.status = 200;
      return {
        data: {
          post,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Post not found') {
          set.status = 404;
          return {
            error: error.message,
            message: 'Failed to retrieve the post.',
          };
        }
      }
      console.error('Failed to retrieve post:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve the post.',
      };
    }
  };

  public updatePost = async ({
    params: { id },
    body,
    set,
    currentUser,
  }: RouteContext) => {
    const { subject, text, boardId, authorId } = body;

    if (currentUser.id !== authorId && currentUser.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'Unauthorized',
        message: 'User is not the author of the post.',
      };
    }

    try {
      await this.postService.updatePost(id, subject, text, boardId, authorId);
      set.status = 200;
    } catch (error) {
      console.error('Failed to update post:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to update post.',
      };
    }
  };

  public deletePostById = async ({
    params: { id },
    set,
    currentUser,
  }: RouteContext) => {
    try {
      const post = await this.postService.getPost(id);
      if (currentUser.id !== post.author.id && currentUser.role !== 'ADMIN') {
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
        error: 'Internal Server Error',
        message: 'Failed to retrieve the post.',
      };
    }

    try {
      await this.postService.removePost(id);
      set.status = 202;
      return {
        message: 'Post deleted successfully.',
      };
    } catch (error) {
      console.error('Failed to delete a post:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to delete the post from the database.',
      };
    }
  };

  public getPostComments = async ({ params: { id }, set }: RouteContext) => {
    try {
      const post = await this.postService.getPostComments(id);
      set.status = 200;
      return {
        data: {
          post,
        },
      };
    } catch (error) {
      console.error('Failed to retrieve comments:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve comments.',
      };
    }
  };
}
