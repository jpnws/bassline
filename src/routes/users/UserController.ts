import { IUserRepository } from 'src/routes/users/UserRepository';

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
  }: ElysiaContext) => {
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
      const user = await this.userRepository.findById(id);
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
