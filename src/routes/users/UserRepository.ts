import { PrismaClient } from '@prisma/client';

export interface IUserRepository {
  findById: (id: number) => Promise<any>;
  createUser: (username: string, password: string) => Promise<any>;
}

export default class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public findById = async (id: number) => {
    return this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
  };

  public createUser = async (username: string, password: string) => {
    return this.prisma.user.create({
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
  };
}