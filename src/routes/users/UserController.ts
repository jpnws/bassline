import { JWTPayloadSpec } from '@elysiajs/jwt';

import { IUserRepository } from 'src/routes/users/UserRepository';

interface JWTPayload extends JWTPayloadSpec {
  id?: number;
  username?: string;
  role?: string;
}

interface UserDeleteContext {
  params: { id: number };
  set: { status: number };
  bearer: string;
  jwt: {
    verify: (token: string) => Promise<JWTPayload | false>;
  };
}

interface UserGetContext {
  params: { id: number };
  set: { status: number };
  bearer: string;
  jwt: {
    verify: (token: string) => Promise<JWTPayload | false>;
  };
}

interface UserCreateContext {
  body: {
    username: string;
    password: string;
  };
  jwt: {
    verify: (token: string) => Promise<JWTPayload | false>;
  };
  set: { status: number };
  bearer: string;
}

export default class UserController {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public getUserById = async ({
    params: { id },
    jwt,
    set,
    bearer,
  }: UserGetContext) => {
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
    const currentUser = (await jwt.verify(bearer)) as JWTPayload;
    if (!currentUser) {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message: 'Authentication toekn was missing or incorrect',
      };
    }
    // * ================================================
    // * Verify that the current user is an admin.
    // * ================================================
    if (currentUser.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message:
          'Only administrators are allowed to retrieve user information.',
      };
    }
    // * ================================================
    // * Retrieve the user information.
    // * ================================================
    try {
      const user = await this.userRepository.findUserById(id);
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

  public createUser = async ({ body, jwt, set, bearer }: UserCreateContext) => {
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
    const user = (await jwt.verify(bearer)) as UserBody;
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
        message: 'Only administrators are allowed to create new users.',
      };
    }
    // * ================================================
    // * Extract the data from the request body.
    // * ================================================
    const { username, password } = body as {
      username: string;
      password: string;
    };
    // * ================================================
    // * Create a new user.
    // * ================================================
    try {
      const user = await this.userRepository.createUser(username, password);
      set.status = 201;
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      console.error('Failed to create user:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to create user.',
      };
    }
  };

  public deleteUserById = async ({
    params: { id },
    jwt,
    set,
    bearer,
  }: UserDeleteContext) => {
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
    const user = (await jwt.verify(bearer)) as UserBody;
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
        message: 'Only administrators are allowed to create new users.',
      };
    }
    // * ================================================
    // * Delete the user.
    // * ================================================
    try {
      await this.userRepository.deleteUserById(id);
      set.status = 202;
      return {
        message: 'User deleted successfully.',
      };
    } catch (error) {
      console.error('Failed to delete user:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to delete user.',
      };
    }
  };
}
