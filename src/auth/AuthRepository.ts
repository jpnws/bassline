import { PrismaClient } from '@prisma/client';

import AuthUserEntity, { IAuthUserEntity } from 'src/auth/AuthUserEntity';

export interface IAuthRepository {
  getUser: (username: string) => Promise<null | IAuthUserEntity>;
  addUser: (username: string, hash: string) => Promise<IAuthUserEntity>;
  addAdmin: (username: string, hash: string) => Promise<IAuthUserEntity>;
}

export default class AuthRepository implements IAuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getUser = async (username: string) => {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        hash: true,
        role: true,
      },
    });
    if (!user) {
      return null;
    }
    return new AuthUserEntity(user.id, user.username, user.hash, user.role);
  };

  public addUser = async (username: string, hash: string) => {
    const user = await this.prisma.user.create({
      data: {
        username,
        hash,
      },
      select: {
        id: true,
        username: true,
        hash: true,
        role: true,
      },
    });
    if (!user) {
      throw new Error('User not created');
    }
    return new AuthUserEntity(user.id, user.username, user.hash, user.role);
  };

  public addAdmin = async (username: string, hash: string) => {
    const user = await this.prisma.user.create({
      data: {
        username,
        hash,
        role: 'ADMIN',
      },
      select: {
        id: true,
        username: true,
        hash: true,
        role: true,
      },
    });
    if (!user) {
      throw new Error('User not created');
    }
    return new AuthUserEntity(user.id, user.username, user.hash, user.role);
  };
}
