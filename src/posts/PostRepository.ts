import { PrismaClient } from '@prisma/client';

import PostCommentEntity, {
  IPostCommentEntity,
  PostComment,
} from 'src/posts/PostCommentEntity';

import PostEntity, { IPostEntity } from 'src/posts/PostEntity';

export interface IPostRepository {
  get: (id: number) => Promise<IPostEntity>;
  add: (
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
  ) => Promise<IPostEntity>;
  delete: (id: number) => Promise<void>;
  update: (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
  ) => Promise<IPostEntity>;
  getPostComments: (id: number) => Promise<IPostCommentEntity>;
}

export default class PostRepository implements IPostRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public get = async (id: number) => {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        subject: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!post) {
      throw new Error('Post not found');
    }
    return new PostEntity(
      post.id,
      post.subject,
      post.text,
      post.createdAt.toString(),
      post.updatedAt.toString(),
      post.board,
      post.author,
    );
  };

  public add = async (
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
  ) => {
    const post = await this.prisma.post.create({
      data: {
        subject,
        text,
        boardId,
        authorId,
      },
      select: {
        id: true,
        subject: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!post) {
      throw new Error('Post not created');
    }
    return new PostEntity(
      post.id,
      post.subject,
      post.text,
      post.createdAt.toString(),
      post.updatedAt.toString(),
      post.board,
      post.author,
    );
  };

  public delete = async (id: number) => {
    const post = await this.prisma.post.delete({
      where: {
        id: id,
      },
    });
    if (!post) {
      throw new Error('Post not deleted.');
    }
  };

  public update = async (
    id: number,
    subject: string,
    text: string,
    boardId: number,
    authorId: number,
  ) => {
    const post = await this.prisma.post.update({
      where: {
        id,
      },
      data: {
        subject,
        text,
        boardId,
        authorId,
      },
      select: {
        id: true,
        subject: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        board: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
    if (!post) {
      throw new Error('Post not updated.');
    }
    return new PostEntity(
      post.id,
      post.subject,
      post.text,
      post.createdAt.toString(),
      post.updatedAt.toString(),
      post.board,
      post.author,
    );
  };

  public getPostComments = async (id: number) => {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        comments: {
          select: {
            id: true,
            text: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!post) {
      throw new Error('Post comment not retrieved');
    }
    const postComments = post.comments.map(item => {
      return {
        id: item.id,
        text: item.text,
        author: {
          id: item.author.id,
          username: item.author.username,
        },
        createdAt: item.createdAt.toString(),
        updatedAt: item.updatedAt.toString(),
      } as PostComment;
    });
    return new PostCommentEntity(post.id, postComments);
  };
}
