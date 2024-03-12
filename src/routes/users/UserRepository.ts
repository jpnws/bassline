import { PrismaClient } from '@prisma/client';

interface IUserRepoistory {
  findById: (id: number) => Promise<any>;
}

export class UserRepository implements IUserRepoistory {
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
