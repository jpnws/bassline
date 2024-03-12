import { PrismaClient } from '@prisma/client';

export interface IUserRepository {
  findById: (id: number) => Promise<any>;
}

export class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public findById = async (id: number) => {
    return await this.prisma.user.findUnique({
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
}
