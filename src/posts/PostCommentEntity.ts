export type PostComment = {
  id: number;
  text: string;
  author: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
};

export interface IPostCommentEntity {
  id: number;
  comments: PostComment[];
}

export default class PostCommentEntity implements IPostCommentEntity {
  id: number;
  comments: PostComment[];

  constructor(id: number, comments: PostComment[]) {
    this.id = id;
    this.comments = comments.map(comment => {
      return { ...comment };
    });
  }
}
