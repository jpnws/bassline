import { ICommentEntity } from 'src/comments/CommentEntity';
import { ICommentRepository } from 'src/comments/CommentRepository';
import { AuthorizationError } from 'src/AuthorizationError';

type CurrentUser = {
  id: number;
  username: string;
  role: string;
};

export interface ICommentService {
  getComment: (id: number) => Promise<ICommentEntity>;
  addComment: (
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => Promise<ICommentEntity>;
  removeComment: (id: number, currentUser: CurrentUser) => Promise<void>;
  updateComment: (
    id: number,
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => Promise<ICommentEntity>;
}

export default class CommentService implements ICommentService {
  commentRepository: ICommentRepository;

  constructor(commentRepository: ICommentRepository) {
    this.commentRepository = commentRepository;
  }

  public getComment = async (id: number) => {
    try {
      return await this.commentRepository.get(id);
    } catch (error) {
      throw error;
    }
  };

  public addComment = async (
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => {
    if (currentUser.id !== authorId) {
      throw new AuthorizationError(
        'The author ID of the comment does not match the ID of the currently logged in user.'
      );
    }
    try {
      return await this.commentRepository.add(text, postId, authorId);
    } catch (error) {
      throw error;
    }
  };

  public removeComment = async (id: number, currentUser: CurrentUser) => {
    const comment = await this.commentRepository.get(id);
    if (currentUser.id !== comment.author.id && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to delete the comment is not the author of the comment or is not an admin.'
      );
    }
    try {
      return await this.commentRepository.delete(id);
    } catch (error) {
      throw error;
    }
  };

  public updateComment = async (
    id: number,
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => {
    if (currentUser.id !== authorId && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to update the comment is not the author of the comment or is not an admin.'
      );
    }
    try {
      return await this.commentRepository.update(id, text, postId, authorId);
    } catch (error) {
      throw error;
    }
  };
}
