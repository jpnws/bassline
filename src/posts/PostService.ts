import { IPostEntity } from 'src/posts/PostEntity';
import { IPostCommentEntity } from 'src/posts/PostCommentEntity';
import { IPostRepository } from 'src/posts/PostRepository';

export interface IPostService {
  getPost: (id: number) => Promise<IPostEntity>;
  addPost: (
    subject: string,
    text: string,
    boardId: number,
    authorId: number
  ) => Promise<IPostEntity>;
  removePost: (id: number) => Promise<void>;
  updatePost: (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number
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
    authorId: number
  ) => {
    try {
      return await this.postRepository.add(subject, text, boardId, authorId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  public removePost = async (id: number) => {
    try {
      return await this.postRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  public updatePost = async (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number
  ) => {
    try {
      return await this.postRepository.update(
        id,
        subject,
        text,
        boardId,
        authorId
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  public getPostComments = async (id: number) => {
    try {
      return await this.postRepository.getPostComments(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
}
