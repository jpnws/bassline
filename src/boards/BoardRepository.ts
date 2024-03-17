import { PrismaClient } from '@prisma/client';

import BoardEntity, { IBoardEntity } from 'src/boards/BoardEntity';
import BoardPostEntity, { IBoardPostEntity } from 'src/boards/BoardPostEntity';

export interface IBoardRepository {
  add: (name: string) => Promise<IBoardEntity>;
  getBoardPosts: (id: number) => Promise<IBoardPostEntity>;
}

export default class BoardRepository implements IBoardRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public add = async (name: string) => {
    const board = await this.prisma.board.create({
      data: {
        name,
      },
    });
    if (!board) {
      throw new Error('Board not created');
    }
    return new BoardEntity(board.id, board.name, board.createdAt.toString());
  };

  public getBoardPosts = async (id: number) => {
    const board = await this.prisma.board.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        posts: {
          select: {
            id: true,
            subject: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });
    if (!board) {
      throw new Error('Failed to retrieve board posts');
    }
    const posts = board.posts.map((post) => {
      return {
        id: post.id,
        subject: post.subject,
        createdAt: post.createdAt.toString(),
        author: {
          id: post.author.id,
          username: post.author.username,
        },
      };
    });
    return new BoardPostEntity(board.id, board.name, posts);
  };
}
