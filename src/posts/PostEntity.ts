export interface IPostEntity {
  id: number;
  subject: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  board: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    username: string;
  };
}

export default class PostEntity implements IPostEntity {
  id: number;
  subject: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  board: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    username: string;
  };

  constructor(
    id: number,
    subject: string,
    text: string,
    createdAt: string,
    updatedAt: string,
    board: { id: number; name: string },
    author: { id: number; username: string }
  ) {
    this.id = id;
    this.subject = subject;
    this.text = text;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.board = { ...board };
    this.author = { ...author };
  }
}
