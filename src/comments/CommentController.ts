import { AuthorizationError } from 'src/errors/AuthorizationError';
import { ItemNotFoundError } from 'src/errors/ItemNotFoundError';
import { ICommentService } from 'src/comments/CommentService';

interface RouteContext {
  params: { id: number };
  body: {
    text: string;
    postId: number;
    authorId: number;
  };
  set: { status: number };
  currentUser: {
    id: number;
    username: string;
    role: string;
  };
}

export default class CommentController {
  private commentService: ICommentService;

  constructor(commentService: ICommentService) {
    this.commentService = commentService;
  }

  public createComment = async ({ body, set, currentUser }: RouteContext) => {
    const { text, postId, authorId } = body;
    try {
      const comment = await this.commentService.addComment(
        text,
        postId,
        authorId,
        currentUser
      );
      set.status = 201;
      return {
        data: {
          comment: {
            id: comment.id,
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
        message: 'Failed to create the comment.',
      };
    }
  };

  public getCommentbyId = async ({ params: { id }, set }: RouteContext) => {
    try {
      const comment = await this.commentService.getComment(id);
      set.status = 200;
      return {
        data: {
          comment,
        },
      };
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        set.status = 404;
        return {
          error: 'Not Found',
          message: error.message,
        };
      }
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve the comment.',
      };
    }
  };

  public updateComment = async ({
    params: { id },
    body,
    set,
    currentUser,
  }: RouteContext) => {
    const { text, postId, authorId } = body;
    try {
      await this.commentService.updateComment(
        id,
        text,
        postId,
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
        message: 'Failed to update comment.',
      };
    }
  };

  public deleteCommentById = async ({
    params: { id },
    set,
    currentUser,
  }: RouteContext) => {
    try {
      await this.commentService.removeComment(id, currentUser);
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
        message: 'Failed to delete the comment.',
      };
    }
  };
}
