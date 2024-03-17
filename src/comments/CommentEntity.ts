export interface ICommentEntity {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  post: {
    id: number;
  };
  author: {
    id: number;
    username: string;
  };
}

export default class CommentEntity implements ICommentEntity {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  post: {
    id: number;
  };
  author: {
    id: number;
    username: string;
  };

  constructor(
    id: number,
    text: string,
    createdAt: string,
    updatedAt: string,
    post: { id: number },
    author: { id: number; username: string },
  ) {
    this.id = id;
    this.text = text;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.post = { ...post };
    this.author = { ...author };
  }
}
