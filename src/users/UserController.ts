import { JWTPayloadSpec } from '@elysiajs/jwt';

import { IUserService } from 'src/users/UserService';

interface JWTPayload extends JWTPayloadSpec {
  id?: number;
  username?: string;
  role?: string;
}

interface RouteContext {
  params: { id: number };
  body: {
    username: string;
    password: string;
    role: string;
  };
  set: { status: number };
  bearer: string;
  jwt: {
    verify: (token: string) => Promise<JWTPayload | false>;
  };
  currentUser: {
    id: number;
    username: string;
    role: string;
  };
}

export default class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  public createUser = async ({ body, set, currentUser }: RouteContext) => {
    if (currentUser.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message: 'Only administrators are allowed to create new users.',
      };
    }
    const { username, password } = body as {
      username: string;
      password: string;
    };
    try {
      const user = await this.userService.addUser(username, password);
      set.status = 201;
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      console.error('Failed to add user:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to add user.',
      };
    }
  };

  public getUserById = async ({
    params: { id },
    set,
    currentUser,
  }: RouteContext) => {
    if (currentUser.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message:
          'Only administrators are allowed to retrieve user information.',
      };
    }
    try {
      const user = await this.userService.getUser(id);
      set.status = 200;
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return {
        error: 'Internal Server Error',
        message: 'Failed to retrieve user information.',
      };
    }
  };

  public updateUser = async ({
    params: { id },
    body,
    set,
    currentUser,
  }: RouteContext) => {
    if (currentUser.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message:
          'Only administrators are allowed to retrieve user information.',
      };
    }
    const { username, role } = body;
    try {
      const user = await this.userService.updateUser(id, username, role);
      set.status = 200;
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      set.status = 500;
      return {
        error: 'Internal Server Error',
        message: 'Failed to update user',
      };
    }
  };

  public deleteUserById = async ({
    params: { id },
    set,
    currentUser,
  }: RouteContext) => {
    if (currentUser.role !== 'ADMIN') {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message: 'Only administrators are allowed to create new users.',
      };
    }
    try {
      await this.userService.removeUser(id);
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

  public getCurrentUser = async ({ set, currentUser }: RouteContext) => {
    try {
      const user = await this.userService.getUser(currentUser.id);
      if (!user) {
        set.status = 404;
        return { message: 'User not found' };
      }
      return {
        data: {
          user,
        },
      };
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      set.status = 500;
    }
  };
}
