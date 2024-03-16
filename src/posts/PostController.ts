import { AuthorizationError } from 'src/AuthorizationError';
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
    try {
      await this.postService.updatePost(
        id,
        subject,
        text,
        boardId,
        authorId,
        currentUser
      );
      set.status = 200;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        set.status = 401;
        return {
          error: 'Unauthorized',
          message: error.message,
        };
      }
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
      await this.postService.removePost(id, currentUser);
      set.status = 202;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        set.status = 401;
        return {
          error: 'Unauthorized',
          message: error.message,
        };
      }
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to delete the post.',
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
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve comments.',
      };
    }
  };
}
