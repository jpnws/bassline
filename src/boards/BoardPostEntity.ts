export interface IBoardPostItemEntity {
  id: number;
  subject: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
  };
}

export interface IBoardPostEntity {
  id: number;
  name: string;
  posts: IBoardPostItemEntity[];
}

export default class BoardPostEntity implements IBoardPostEntity {
  id: number;
  name: string;
  posts: IBoardPostItemEntity[];

  constructor(id: number, name: string, posts: IBoardPostItemEntity[]) {
    this.id = id;
    this.name = name;
    this.posts = [...posts];
  }
}
