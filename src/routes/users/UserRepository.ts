import { PrismaClient, UserRole } from '@prisma/client';
import { User } from 'src/routes/users/UserEntity';

export interface IUserRepository {
  findUserById: (id: number) => Promise<User>;
  createUser: (username: string, password: string) => Promise<any>;
  deleteUserById: (id: number) => Promise<any>;
  findUserByIdUsernameRole: (
    id: number,
    username: string,
    role: UserRole
  ) => Promise<any>;
  updateUserById: (id: number, username: string, role: string) => Promise<any>;
}

export default class UserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public findUserById = async (id: number): Promise<User> => {
    return new Promise<User>(async (resolve, reject) => {
      try {
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
          reject(new Error('User not found'));
        } else {
          resolve({
            id: user.id,
            username: user.username,
            role: user.role,
          } as User);
        }
      } catch (error) {
        reject(error);
      }
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

  public deleteUserById = async (id: number) => {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  };

  public findUserByIdUsernameRole(
    id: number,
    username: string,
    role: UserRole
  ) {
    return this.prisma.user.findUnique({
      where: {
        id: id,
        username: username,
        role: role,
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });
  }

  public updateUserById(id: number, username: string, role: string) {
    return this.prisma.user.update({
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
  }
}
