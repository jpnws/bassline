import { AuthorizationError } from 'src/errors/AuthorizationError';
import { InvalidInputError } from 'src/errors/InvalidInputError';
import { ItemAlreadyExistsError } from 'src/errors/ItemAlreadyExistsError';
import { ItemNotFoundError } from 'src/errors/ItemNotFoundError';

import { IAuthService } from 'src/auth/AuthService';

export interface IJwt {
  verify: (
    token: string,
  ) => Promise<{ id: number; username: string; role: string }>;
  sign: ({
    id,
    username,
    role,
  }: {
    id: number;
    username: string;
    role: string;
  }) => Promise<string>;
}

interface RouteContext {
  body: {
    username: string;
    password: string;
  };
  set: { status: number };
  jwt: IJwt;
  bearer: string;
}

export default class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  public signin = async ({ body, set, jwt }: RouteContext) => {
    const { username, password } = body;
    try {
      const user = await this.authService.signInUser(username, password, jwt);
      set.status = 200;
      return {
        data: {
          user: {
            id: user.id,
          },
          token: user.token,
        },
      };
    } catch (error) {
      if (error instanceof InvalidInputError) {
        set.status = 401;
        return {
          status: 'Bad request',
          message: error.message,
        };
      }
      if (error instanceof ItemNotFoundError) {
        set.status = 401;
        return {
          status: 'Bad request',
          message: error.message,
        };
      }
      set.status = 500;
      return {
        status: 'Internal server error',
        message: 'Failed to sign in user.',
      };
    }
  };

  public demoUserSignIn = async ({ set, jwt }: RouteContext) => {
    try {
      const user = await this.authService.signInDemoUser(jwt);
      set.status = 200;
      return {
        data: {
          user: {
            id: user.id,
          },
          token: user.token,
        },
      };
    } catch (error) {
      set.status = 500;
      return {
        status: 'Internal server error',
        message: 'Failed to sign in user.',
      };
    }
  };

  public demoAdminSignIn = async ({ set, jwt }: RouteContext) => {
    try {
      const user = await this.authService.signInDemoAdmin(jwt);
      set.status = 200;
      return {
        data: {
          user: {
            id: user.id,
          },
          token: user.token,
        },
      };
    } catch (error) {
      set.status = 500;
      return {
        status: 'Internal server error',
        message: 'Failed to sign in user.',
      };
    }
  };

  public signout = async ({ set }: RouteContext) => {
    try {
      await this.authService.signOutUser();
      set.status = 200;
    } catch (error) {
      if (error instanceof AuthorizationError) {
        set.status = 401;
        return {
          error: 'User not authorized',
          message: 'Authentication token was invalid',
        };
      }
      set.status = 500;
      return {
        status: 'Internal server error',
        message: 'Failed to sign out user.',
      };
    }
  };

  public signup = async ({ body, set, jwt }: RouteContext) => {
    const { username, password } = body;
    try {
      const user = await this.authService.signUpUser(username, password, jwt);
      set.status = 201;
      return {
        data: {
          user: {
            id: user.id,
          },
          token: user.token,
        },
      };
    } catch (error) {
      if (error instanceof InvalidInputError) {
        set.status = 400;
        return {
          error: 'Bad input',
          message: 'Username or password cannot be empty.',
        };
      }
      if (error instanceof ItemAlreadyExistsError) {
        set.status = 400;
        return {
          error: 'Bad input',
          message: 'User already exists.',
        };
      }
      set.status = 500;
      return {
        error: 'Internal server error',
        message: 'Failed to create an account.',
      };
    }
  };
}
