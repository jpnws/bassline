import { ICommentEntity } from 'src/comments/CommentEntity';
import { ICommentRepository } from 'src/comments/CommentRepository';
import { AuthorizationError } from 'src/errors/AuthorizationError';
import { InvalidInputError } from 'src/errors/InvalidInputError';

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
    currentUser: CurrentUser,
  ) => Promise<ICommentEntity>;
  updateComment: (
    id: number,
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => Promise<ICommentEntity>;
  removeComment: (id: number, currentUser: CurrentUser) => Promise<void>;
}

export default class CommentService implements ICommentService {
  commentRepository: ICommentRepository;

  constructor(commentRepository: ICommentRepository) {
    this.commentRepository = commentRepository;
  }

  public getComment = async (id: number) => {
    return await this.commentRepository.get(id);
  };

  public addComment = async (
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => {
    if (currentUser.id !== authorId) {
      throw new AuthorizationError(
        'The author ID of the comment does not match the ID of the currently logged in user.',
      );
    }
    if (!text || text.length === 0 || text.length > 350) {
      throw new InvalidInputError(
        'The comment should be at least 1 character and at most 350 characters.',
      );
    }
    return await this.commentRepository.add(text, postId, authorId);
  };

  public updateComment = async (
    id: number,
    text: string,
    postId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => {
    if (currentUser.id !== authorId && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to update the comment is not the author of the comment or is not an admin.',
      );
    }
    if (!text || text.length === 0 || text.length > 350) {
      throw new InvalidInputError(
        'The comment should be at least 1 character and at most 350 characters.',
      );
    }
    return await this.commentRepository.update(id, text, postId, authorId);
  };

  public removeComment = async (id: number, currentUser: CurrentUser) => {
    const comment = await this.commentRepository.get(id);
    if (currentUser.id !== comment.author.id && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to delete the comment is not the author of the comment or is not an admin.',
      );
    }
    return await this.commentRepository.delete(id);
  };
}
