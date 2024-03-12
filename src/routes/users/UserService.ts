import { User } from 'src/routes/users/UserEntity';
import { IUserRepository } from 'src/routes/users/UserRepository';

interface IUserService {
  getUserById: (id: number) => Promise<User>;
}

export default class UserService {
  userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  public getUserById = async (id: number) => {
    try {
      const foundUser = await this.userRepository.findUserById(id);
      const user = {
        foundUser.
      }
    } catch (error) {
      console.error(error);
    }
  };
}
