import { PrismaClient, UserRole } from '@prisma/client';

import UserEntity, { IUserEntity } from 'src/users/UserEntity';

export interface IUserRepository {
  get: (id: number) => Promise<IUserEntity>;
  add: (username: string, password: string) => Promise<IUserEntity>;
  delete: (id: number) => Promise<void>;
  update: (id: number, username: string, role: string) => Promise<IUserEntity>;
}

export default class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public get = async (id: number) => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return new UserEntity(user.id, user.username, user.role);
  };

  public add = async (username: string, password: string) => {
    const user = await this.prisma.user.create({
      data: {
        username,
        hash: await Bun.password.hash(password),
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
    if (!user) {
      throw new Error('Error creating user.');
    }
    return new UserEntity(user.id, user.username, user.role);
  };

  public delete = async (id: number) => {
    const user = await this.prisma.user.delete({
      where: {
        id,
      },
    });
    if (!user) {
      throw new Error('Error deleting user.');
    }
  };

  public update = async (id: number, username: string, role: string) => {
    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        username,
        role: role as UserRole,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
    if (!user) {
      throw new Error('Error updating user.');
    }
    return new UserEntity(user.id, user.username, user.role);
  };
}
