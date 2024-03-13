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
}

export default class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  public getUserById = async ({
    params: { id },
    jwt,
    set,
    bearer,
  }: RouteContext) => {
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

  public createUser = async ({ body, jwt, set, bearer }: RouteContext) => {
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
    const currentUser = (await jwt.verify(bearer)) as UserBody;
    if (!currentUser) {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message: 'Authentication toekn was missing or incorrect',
      };
    }
    // * ================================================
    // * Verify that the user is an admin.
    // * ================================================
    if (currentUser.role !== 'ADMIN') {
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
    // * Add a new user.
    // * ================================================
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

  public deleteUserById = async ({
    params: { id },
    jwt,
    set,
    bearer,
  }: RouteContext) => {
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
    const currentUser = (await jwt.verify(bearer)) as UserBody;
    if (!currentUser) {
      set.status = 401;
      return {
        error: 'User Unauthorized',
        message: 'Authentication toekn was missing or incorrect',
      };
    }
    // * ================================================
    // * Verify that the user is an admin.
    // * ================================================
    if (currentUser.role !== 'ADMIN') {
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

  public getCurrentUser = async ({ jwt, set, bearer }: RouteContext) => {
    // * ================================================
    // * Ensure that the user is already authenticated.
    // * ================================================
    if (!bearer) {
      set.status = 400;
      return;
    }
    // * ================================================
    // * Verify the user's JWT.
    // * ================================================
    const currentUser = (await jwt.verify(bearer)) as UserBody;
    if (!currentUser) {
      set.status = 401;
      return;
    }
    // * ================================================
    // * Ensure that the user's JWT has valid data.
    // * ================================================
    if (
      currentUser.id === undefined ||
      currentUser.username === undefined ||
      currentUser.role === undefined
    ) {
      set.status = 401;
      return;
    }
    // * ================================================
    // * Check user existence and respond with user data.
    // * ================================================
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

  public updateUser = async ({
    params: { id },
    body,
    jwt,
    set,
    bearer,
  }: RouteContext) => {
    // * ================================================
    // * Ensure that the user is already authenticated.
    // * ================================================
    if (!bearer) {
      set.status = 400;
      return {
        error: 'User not authenticated',
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
        error: 'User unauthorized',
        message: 'Authentication token was missing or incorrect',
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
    // * Extract the data from the request body.
    // * ================================================
    const { username, role } = body;
    // * ================================================
    // * Create the user.
    // * ================================================
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
}
