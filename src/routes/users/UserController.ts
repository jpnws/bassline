import { JWTPayloadSpec } from '@elysiajs/jwt';
import { PrismaClient } from '@prisma/client';

interface JWTPayload extends JWTPayloadSpec {
  id?: number;
  username?: string;
  role?: string;
}

interface GetUserContext {
  params: { id: number };
  set: { status: number };
  bearer: string;
  jwt: {
    verify: (token: string) => Promise<JWTPayload | false>;
  };
}

export default class UserController {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public getUserById = async ({
    params: { id },
    jwt,
    set,
    bearer,
  }: GetUserContext) => {
    // * ================================================
    // * Ensure that the user is already authenticated.
    // * ================================================
    if (!bearer) {
      set.status = 400;
      return {
        error: 'User Not Authenticated',
        message: 'Authentication token was missing.',
      };
    }
    // * ================================================
    // * Verify the user's JWT.
    // * ================================================
    const user = (await jwt.verify(bearer)) as JWTPayload;
    if (!user) {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message: 'Authentication toekn was missing or incorrect',
      };
    }
    // * ================================================
    // * Verify that the user is an admin.
    // * ================================================
    if (user.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message:
          'Only administrators are allowed to retrieve user information.',
      };
    }
    // * ================================================
    // * Retrieve the user.
    // * ================================================
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
        set.status = 404;
        return {
          error: 'User Not Found',
          message: 'The user with the specified ID does not exist.',
        };
      }
      set.status = 200;
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve user.',
      };
    }
  };
}
