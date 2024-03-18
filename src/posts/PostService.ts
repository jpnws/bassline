import sanitizeHtml from 'sanitize-html';

import { AuthorizationError } from 'src/errors/AuthorizationError';
import { InvalidInputError } from 'src/errors/InvalidInputError';
import { IPostCommentEntity } from 'src/posts/PostCommentEntity';
import { IPostEntity } from 'src/posts/PostEntity';
import { IPostRepository } from 'src/posts/PostRepository';

type CurrentUser = {
  id: number;
  username: string;
  role: string;
};

export interface IPostService {
  getPost: (id: number) => Promise<IPostEntity>;
  addPost: (
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => Promise<IPostEntity>;
  removePost: (id: number, currentUser: CurrentUser) => Promise<void>;
  updatePost: (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => Promise<IPostEntity>;
  getPostComments: (id: number) => Promise<IPostCommentEntity>;
}

export default class PostService implements IPostService {
  postRepository: IPostRepository;

  constructor(postRepository: IPostRepository) {
    this.postRepository = postRepository;
  }

  public getPost = async (id: number) => {
    return await this.postRepository.get(id);
  };

  public addPost = async (
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => {
    if (currentUser.id !== authorId) {
      throw new AuthorizationError(
        'The author ID of the post does not match the ID of the currently logged in user.',
      );
    }
    if (text.length > 100 || text.length < 5) {
      throw new InvalidInputError(
        'The length of the text must be between 5 and 100 characters.',
      );
    }
    const sanitizedText = sanitizeHtml(text);
    return await this.postRepository.add(
      subject,
      sanitizedText,
      boardId,
      authorId,
    );
  };

  public removePost = async (id: number, currentUser: CurrentUser) => {
    const post = await this.postRepository.get(id);
    if (currentUser.id !== post.author.id && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to delete the post is not the author of the post or is not an admin.',
      );
    }
    return await this.postRepository.delete(id);
  };

  public updatePost = async (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser,
  ) => {
    if (currentUser.id !== authorId && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to update the post is not the author of the post or is not an admin.',
      );
    }
    if (text.length > 100 || text.length < 5) {
      throw new InvalidInputError(
        'The length of the text must be between 5 and 100 characters.',
      );
    }
    const sanitizedText = sanitizeHtml(text);
    return await this.postRepository.update(
      id,
      subject,
      sanitizedText,
      boardId,
      authorId,
    );
  };

  public getPostComments = async (id: number) => {
    return await this.postRepository.getPostComments(id);
  };
}
