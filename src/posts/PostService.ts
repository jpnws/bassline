import { IPostEntity } from 'src/posts/PostEntity';
import { IPostCommentEntity } from 'src/posts/PostCommentEntity';
import { IPostRepository } from 'src/posts/PostRepository';
import { AuthorizationError } from 'src/AuthorizationError';

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
    currentUser: CurrentUser
  ) => Promise<IPostEntity>;
  removePost: (id: number, currentUser: CurrentUser) => Promise<void>;
  updatePost: (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => Promise<IPostEntity>;
  getPostComments: (id: number) => Promise<IPostCommentEntity>;
}

export default class PostService implements IPostService {
  postRepository: IPostRepository;

  constructor(postRepository: IPostRepository) {
    this.postRepository = postRepository;
  }

  public getPost = async (id: number) => {
    try {
      return await this.postRepository.get(id);
    } catch (error) {
      throw error;
    }
  };

  public addPost = async (
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => {
    if (currentUser.id !== authorId) {
      throw new AuthorizationError(
        'The author ID of the post does not match the ID of the currently logged in user.'
      );
    }
    try {
      return await this.postRepository.add(subject, text, boardId, authorId);
    } catch (error) {
      throw error;
    }
  };

  public removePost = async (id: number, currentUser: CurrentUser) => {
    const post = await this.postRepository.get(id);
    if (currentUser.id !== post.author.id && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to delete the post is not the author of the post or is not an admin.'
      );
    }
    try {
      return await this.postRepository.delete(id);
    } catch (error) {
      throw error;
    }
  };

  public updatePost = async (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
    currentUser: CurrentUser
  ) => {
    if (currentUser.id !== authorId && currentUser.role !== 'ADMIN') {
      throw new AuthorizationError(
        'User attempting to update the post is not the author of the post or is not an admin.'
      );
    }
    try {
      return await this.postRepository.update(
        id,
        subject,
        text,
        boardId,
        authorId
      );
    } catch (error) {
      throw error;
    }
  };

  public getPostComments = async (id: number) => {
    try {
      return await this.postRepository.getPostComments(id);
    } catch (error) {
      throw error;
    }
  };
}
