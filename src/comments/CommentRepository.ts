import { ItemNotFoundError } from 'src/errors/ItemNotFoundError';

import { PrismaClient } from '@prisma/client';

import CommentEntity, { ICommentEntity } from 'src/comments/CommentEntity';

export interface ICommentRepository {
  get: (id: number) => Promise<ICommentEntity>;
  add: (
    text: string,
    postId: number,
    authorId: number
  ) => Promise<ICommentEntity>;
  delete: (id: number) => Promise<void>;
  update: (
    id: number,
    text: string,
    postId: number,
    authorId: number
  ) => Promise<ICommentEntity>;
}

export default class CommentRepository implements ICommentRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public get = async (id: number) => {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
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
    if (!comment) {
      throw new ItemNotFoundError('Comment not found');
    }
    return new CommentEntity(
      comment.id,
      comment.text,
      comment.createdAt.toString(),
      comment.updatedAt.toString(),
      comment.post,
      comment.author
    );
  };

  public add = async (text: string, postId: number, authorId: number) => {
    const comment = await this.prisma.comment.create({
      data: {
        text,
        postId,
        authorId,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
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
    if (!comment) {
      throw new Error('Comment not created');
    }
    return new CommentEntity(
      comment.id,
      comment.text,
      comment.createdAt.toString(),
      comment.updatedAt.toString(),
      comment.post,
      comment.author
    );
  };

  public delete = async (id: number) => {
    const comment = await this.prisma.comment.delete({
      where: {
        id,
      },
    });
    if (!comment) {
      throw new Error('Comment not deleted');
    }
  };

  public update = async (
    id: number,
    text: string,
    postId: number,
    authorId: number
  ) => {
    const comment = await this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        text,
        postId,
        authorId,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        updatedAt: true,
        post: {
          select: {
            id: true,
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
    if (!comment) {
      throw new Error('Comment not updated');
    }
    return new CommentEntity(
      comment.id,
      comment.text,
      comment.createdAt.toString(),
      comment.updatedAt.toString(),
      comment.post,
      comment.author
    );
  };
}
