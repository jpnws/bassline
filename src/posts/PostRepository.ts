import { PrismaClient } from '@prisma/client';

import PostEntity, { IPostEntity } from 'src/posts/PostEntity';

export interface IPostRepository {
  get: (id: any) => Promise<IPostEntity>;
  // add: (
  //   subject: string,
  //   text: string,
  //   boardId: number,
  //   authorId: number
  // ) => Promise<IPostEntity>;
  // delete: (id: number) => Promise<void>;
  // update: (
  //   id: number,
  //   subject: string,
  //   text: string,
  //   boardId: number,
  //   authorId: number
  // ) => Promise<IPostEntity>;
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
      post.author
    );
  };
}
